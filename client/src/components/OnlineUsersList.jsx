import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OnlineUsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOnlineUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const { data } = await axios.get(`http://localhost:5000/api/users/online`, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUsers(data.onlineUsers || []);
            } catch (err) {
                console.error('❌ Failed to fetch online users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOnlineUsers();
    }, []);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">🌐 All Online Users</h2>
            {loading ? (
                <p className="text-gray-500 italic">Loading...</p>
            ) : users.length === 0 ? (
                <p className="text-gray-500 italic">No users are online.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <li key={user._id} className="py-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                <span className="text-sm font-medium text-gray-800">{user.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OnlineUsersList;
