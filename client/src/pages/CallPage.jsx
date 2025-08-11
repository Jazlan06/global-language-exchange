import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';

const CallPage = () => {
    const { user } = useAuth();
    const { chatId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(null);
    const [refsReady, setRefsReady] = useState(false); // ✅ Track when refs are mounted

    const { isCaller, receiver } = location.state || {};

    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach(track => track.stop());
            remoteStream.current = null;
        }
        socket.emit('call_ended', { to: receiver?._id });
        navigate('/chat');
    };

    // ✅ Trigger startCall only after video refs are ready
    useEffect(() => {
        if (!receiver || !refsReady) return;

        let cancelled = false;

        const startCall = async () => {
            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!localVideoRef.current || !remoteVideoRef.current) {
                    console.warn('Refs still null after refsReady');
                    return;
                }

                localVideoRef.current.srcObject = localStream.current;

                remoteStream.current = new MediaStream();
                remoteVideoRef.current.srcObject = remoteStream.current;

                peerConnection.current = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });

                localStream.current.getTracks().forEach(track =>
                    peerConnection.current.addTrack(track, localStream.current)
                );

                peerConnection.current.ontrack = event => {
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.current.addTrack(track);
                    });
                };

                peerConnection.current.onicecandidate = event => {
                    if (event.candidate) {
                        socket.emit('webrtc_ice_candidate', {
                            to: receiver._id,
                            candidate: event.candidate,
                            from: user._id,
                        });
                    }
                };

                if (isCaller) {
                    const offer = await peerConnection.current.createOffer();
                    await peerConnection.current.setLocalDescription(offer);

                    socket.emit('webrtc_offer', {
                        to: receiver._id,
                        offer,
                        chatId,
                        fromUser: user,
                    });
                }

            } catch (error) {
                console.error('❌ Error starting call:', error);
            }
        };

        startCall();

        return () => {
            cancelled = true;
            endCall();
        };
    }, [receiver, socket, chatId, isCaller, user._id, refsReady]);

    // ✅ ICE + call ended listeners
    useEffect(() => {
        const handleAnswer = async ({ answer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleCandidate = async ({ candidate }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding received ICE candidate', err);
                }
            }
        };

        const handleCallEnded = () => {
            alert('The other user ended the call.');
            endCall();
        };

        socket.on('webrtc_answer', handleAnswer);
        socket.on('webrtc_ice_candidate', handleCandidate);
        socket.on('call_ended', handleCallEnded);

        return () => {
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleCandidate);
            socket.off('call_ended', handleCallEnded);
        };
    }, [socket]);

    // ✅ Ref check
    useEffect(() => {
        if (localVideoRef.current && remoteVideoRef.current) {
            setRefsReady(true);
        }
    }, [receiver]); // Trigger once receiver exists and component renders

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
            <h2 className="text-2xl mb-4">Call with {receiver?.name}</h2>

            {receiver && (
                <>
                    <div className="flex gap-4">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-64 rounded-lg border-2 border-green-500"
                        />
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-64 rounded-lg border-2 border-blue-500"
                        />
                    </div>

                    <button
                        onClick={endCall}
                        className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                        End Call
                    </button>
                </>
            )}
        </div>
    );
};

export default CallPage;
