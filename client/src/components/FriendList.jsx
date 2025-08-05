import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserGroupIcon } from '@heroicons/react/24/solid';

const FriendList = ({ onSelectUser }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('/api/friends/list', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriends(data);
            } catch (err) {
                console.error('❌ Error fetching friends:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    if (loading) return <p className="text-gray-500 italic">Loading friends...</p>;
    if (friends.length === 0) return <p className="text-gray-600">No friends found.</p>;

    return (
        <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-semibold mb-4">👥 Your Friends</h2>
            <ul className="space-y-4">
                {friends.map(friend => (
                    <li key={friend._id} className="flex justify-between items-center border-b pb-2">
                        <div>
                            <p className="font-medium text-gray-800">{friend.name}</p>
                            <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                        <button
                            onClick={() => onSelectUser(friend._id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                            title="View mutual friends"
                        >
                            <UserGroupIcon className="w-5 h-5" />
                        </button>

                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;
