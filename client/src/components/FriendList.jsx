// components/FriendList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/friends/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriends(data);
        } catch (err) {
            console.error('❌ Error fetching friend list:', err);
            setErrorMsg('Failed to load friends.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    if (loading) return <p className="text-gray-500 italic">Loading friends...</p>;
    if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;
    if (friends.length === 0) return <p className="text-gray-600">You don’t have any friends yet.</p>;

    return (
        <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-semibold mb-4">👥 Your Friends</h2>
            <ul className="space-y-4">
                {friends.map((friend) => (
                    <li key={friend._id} className="flex items-center justify-between border-b pb-2">
                        <div>
                            <p className="font-medium text-gray-800">{friend.name}</p>
                            <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                        {/* Optional buttons here later */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;
