import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OnlineFriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchOnlineFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const { data } = await axios.get(`http://localhost:5000/api/users/friends/online`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(data.onlineFriends);
            } catch (err) {
                console.error('❌ Failed to fetch online friends:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOnlineFriends();
    }, []);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">🟢 Online Friends</h2>
            {loading ? (
                <p className="text-gray-500 italic">Loading...</p>
            ) : friends.length === 0 ? (
                <p className="text-gray-500 italic">No friends are online.</p>
            ) : (
                <ul className="space-y-3">
                    {friends.map((friend) => (
                        <li
                            key={friend._id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition"
                        >
                            <div className="w-3 h-3 bg-green-500 rounded-full" title="Online" />
                            <span className="font-medium text-gray-800">{friend.name}</span>
                            <span className="text-xs text-gray-400 truncate">{friend.email}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OnlineFriendsList;
