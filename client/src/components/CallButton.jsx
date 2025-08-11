import React from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';

const CallButton = ({ chatId, receiver }) => {
    const navigate = useNavigate();

    const handleStartCall = () => {
        if (!chatId || !receiver?._id) return;

        // Emit socket event to notify receiver
        socket.emit('start_call', {
            chatId,
            receiverId: receiver._id,
        });

        // Navigate to call screen
        navigate(`/call/${chatId}`);
    };

    return (
        <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleStartCall}
        >
            📞 Call
        </button>
    );
};

export default CallButton;
