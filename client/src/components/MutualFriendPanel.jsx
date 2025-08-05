import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MutualFriendsPanel = ({ targetUserId }) => {
    const [mutualFriends, setMutualFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMutualFriends = async () => {
            if (!targetUserId) return;

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`/api/friends/mutual/${targetUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('✅ Mutual friends response:', data);

                setMutualFriends(data);
                setError('');
            } catch (err) {
                console.error('❌ Failed to fetch mutual friends:', err);
                setError('Could not load mutual friends.');
            } finally {
                setLoading(false);
            }
        };

        fetchMutualFriends();
    }, [targetUserId]);

    if (!targetUserId) return null;
    if (loading) return <p className="text-gray-500 italic">Loading mutual friends...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (mutualFriends.length === 0) return <p className="text-gray-600">No mutual friends found.</p>;

    return (
        <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-3">🤝 Mutual Friends</h3>
            <ul className="space-y-3">
                {mutualFriends.map(friend => (
                    <li key={friend._id} className="border-b pb-2">
                        <p className="font-medium text-gray-800">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.email}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MutualFriendsPanel;
