import React, { useState, useEffect } from "react";
import axios from 'axios';

const FriendRequestButton = ({ targetUserId }) => {
    const [status, setStatus] = useState('idle');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkFriendStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data: friends } = await axios.get('/api/friends/list', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const isFriend = friends.some(friend => friend._id === targetUserId);
                if (isFriend) {
                    setStatus('friends');
                    return;
                }

                const { data: pending } = await axios.get('/api/friends/pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const alreadyRequested = pending.some(req => req.sender._id === targetUserId);
                if (alreadyRequested) {
                    setStatus('pending');
                    return;
                }

                setStatus('idle');
            } catch (err) {
                console.error('Error checking friend status:', err);
                setStatus('error');
            }
        }

        checkFriendStatus();
    }, [targetUserId]);

    const handleSendRequest = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('/api/friends/request', { receiverId: targetUserId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus('sent');
        } catch (err) {
            console.error('Failed to send friend request:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const getButtonContent = () => {
        switch (status) {
            case 'friends':
                return '✅ Friends';
            case 'pending':
                return '⏳ Pending';
            case 'sent':
                return '✅ Sent!';
            case 'error':
                return '❌ Error';
            default:
                return '➕ Add Friend';
        }
    };

    return (
        <button
            onClick={handleSendRequest}
            disabled={status !== 'idle' || loading}
            className={`
                px-4 py-2 rounded transition-all
                text-white text-sm font-medium
                ${status === 'idle' ? 'bg-blue-600 hover:bg-blue-700' :
                    status === 'friends' ? 'bg-green-600' :
                        status === 'pending' ? 'bg-yellow-500' :
                            status === 'sent' ? 'bg-green-500 animate-pulse' :
                                'bg-red-500'}
                ${loading ? 'opacity-70 cursor-wait' : ''}
            `}
        >
            {loading ? 'Sending...' : getButtonContent()}
        </button>
    );
};
export default FriendRequestButton;