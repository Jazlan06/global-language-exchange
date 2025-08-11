import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import Peer from 'simple-peer/simplepeer.min.js';
import { jwtDecode } from 'jwt-decode';

const CallPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();

    const [remoteStream, setRemoteStream] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const streamRef = useRef(null);

    const currentUserId = jwtDecode(localStorage.getItem('token'))?.id;

    useEffect(() => {
        const initCall = async () => {
            socket.emit('join_room', { chatId });
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            localVideoRef.current.srcObject = stream;

            // Create peer
            peerRef.current = new Peer({ initiator: true, trickle: false, stream });

            peerRef.current.on('signal', signal => {
                socket.emit('webrtc_offer', { chatId, signal });
            });

            peerRef.current.on('stream', stream => {
                setRemoteStream(stream);
                remoteVideoRef.current.srcObject = stream;
            });

            socket.on('webrtc_answer', ({ signal }) => {
                peerRef.current.signal(signal);
            });

            socket.on('webrtc_candidate', ({ candidate }) => {
                peerRef.current.signal(candidate);
            });

            socket.emit('start_call_session', { chatId });
        };

        initCall();

        return () => {
            socket.emit('end_call_session', { chatId });
            streamRef.current?.getTracks().forEach(track => track.stop());
            peerRef.current?.destroy();
            socket.off('webrtc_answer');
            socket.off('webrtc_candidate');
        };
    }, [chatId]);

    const handleEndCall = () => {
        navigate('/chat');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <div className="relative w-full max-w-4xl h-2/3 bg-black rounded-lg overflow-hidden">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-40 h-40 absolute bottom-4 right-4 border-2 border-white rounded-lg object-cover"
                />
            </div>
            <button
                onClick={handleEndCall}
                className="mt-8 px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
                End Call
            </button>
        </div>
    );
};

export default CallPage;
