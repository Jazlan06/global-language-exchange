import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';

const IncomingCallHandler = () => {
    const [incomingCall, setIncomingCall] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('incoming_call', ({ chatId, fromUser }) => {
            setIncomingCall({ chatId, fromUser });
        });

        socket.on('call_ended', () => {
            setIncomingCall(null);
        });

        return () => {
            socket.off('incoming_call');
            socket.off('call_ended');
        };
    }, []);

    const handleAccept = () => {
        navigate(`/call/${incomingCall.chatId}`);
        setIncomingCall(null);
    };

    const handleDecline = () => {
        socket.emit('call_declined', { chatId: incomingCall.chatId });
        setIncomingCall(null);
    };

    if (!incomingCall) return null;

    return (
        <div className="fixed bottom-4 left-4 bg-white text-black p-4 rounded shadow-lg z-50">
            <p><strong>{incomingCall.fromUser.name}</strong> is calling...</p>
            <div className="mt-2 flex gap-2">
                <button onClick={handleAccept} className="bg-green-500 px-4 py-1 text-white rounded">Accept</button>
                <button onClick={handleDecline} className="bg-red-500 px-4 py-1 text-white rounded">Decline</button>
            </div>
        </div>
    );
};

export default IncomingCallHandler;
