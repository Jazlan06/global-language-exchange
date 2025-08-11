import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IncomingCallModal from '../components/Call/IncomingCallModal';
import { useSocket } from '../context/SocketContext';

const IncomingCallHandler = ({ currentUser }) => {
    const [incomingCall, setIncomingCall] = useState(null);
    const socket = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = ({ fromUser, chatId, offer }) => {
            setIncomingCall({ caller: fromUser, chatId, offer });
        };

        socket.on('incoming_call', handleIncomingCall);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
        };
    }, [socket]);

    const acceptCall = () => {
        navigate(`/call/${incomingCall.chatId}/receive`, {
            state: {
                fromUser: incomingCall.caller,
                offer: incomingCall.offer
            }
        });
        setIncomingCall(null);
    };

    const declineCall = () => {
        socket.emit('call_declined', { to: incomingCall.caller._id });
        setIncomingCall(null);
    };

    if (!incomingCall) return null;

    return (
        <IncomingCallModal
            callerName={incomingCall.caller.name}
            onAccept={acceptCall}
            onDecline={declineCall}
        />
    );
};

export default IncomingCallHandler;
