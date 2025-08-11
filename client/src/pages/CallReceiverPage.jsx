import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const CallReceiverPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const remoteStream = useRef(null);

    const { fromUser, offer } = location.state || {};

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
        socket.emit('call_ended', { to: fromUser?._id });
        navigate('/chat');
    };

    useLayoutEffect(() => {
        if (!fromUser || !offer) {
            navigate('/chat');
            return;
        }

        let cancelled = false;

        const waitForRefs = () =>
            new Promise(resolve => {
                const checkRefs = () => {
                    if (localVideoRef.current && remoteVideoRef.current) {
                        resolve();
                    } else {
                        requestAnimationFrame(checkRefs);
                    }
                };
                checkRefs();
            });

        const startReceivingCall = async () => {
            await waitForRefs();

            if (cancelled) return;

            try {
                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
                            to: fromUser._id,
                            candidate: event.candidate,
                        });
                    }
                };

                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit('webrtc_answer', {
                    to: fromUser._id,
                    answer,
                });

            } catch (error) {
                console.error('❌ Error handling incoming call:', error);
            }
        };

        startReceivingCall();

        return () => {
            cancelled = true;
            endCall();
        };
    }, [fromUser, offer, navigate, socket]);

    useEffect(() => {
        const handleCandidate = async ({ candidate }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error('Error adding ICE candidate', err);
                }
            }
        };

        const handleCallEnded = () => {
            alert('The other user ended the call.');
            endCall();
        };

        socket.on('webrtc_ice_candidate', handleCandidate);
        socket.on('call_ended', handleCallEnded);

        return () => {
            socket.off('webrtc_ice_candidate', handleCandidate);
            socket.off('call_ended', handleCallEnded);
        };
    }, [socket]);

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
            <h2 className="text-2xl mb-4">Call from {fromUser?.name}</h2>

            {fromUser && (
                <>
                    <div className="flex gap-4">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-64 border-2 border-green-500 rounded-lg"
                        />
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-64 border-2 border-blue-500 rounded-lg"
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

export default CallReceiverPage;
