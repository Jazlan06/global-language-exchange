import { useSocket } from '../context/SocketContext';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function CallButton({ chatId, receiver }) {
    const { token, user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const startCall = async () => {
        try {
            const res = await axios.post(
                '/api/calls/start',
                { chatId, receiverId: receiver._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const session = res.data.session;

            socket.emit('webrtc_offer', {
                to: receiver._id,
                fromUser: user,
                chatId: chatId,
                sessionId: session._id,
            });

            // Navigate to the call screen immediately
            navigate(`/call/${chatId}`, {
                state: {
                    sessionId: session._id,
                    isCaller: true,
                    receiver,
                },
            });
        } catch (err) {
            console.error('Error starting call:', err);
            toast.error('Could not start call. Try again.');
        }
    };

    return (
        <button
            onClick={startCall}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
        >
            📞 Call
        </button>
    );
}
