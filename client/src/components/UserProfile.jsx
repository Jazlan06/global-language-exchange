import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token'); // Ensure token exists

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchProfile();
    }, [token]);

    if (!user) return <div className="animate-pulse text-gray-500">Loading profile...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
                <img
                    src={user.profilePic || '/default-avatar.png'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-gray-700">Languages</h3>
                <p><strong>Knows:</strong> {user.languagesKnown?.map(l => l.language).join(', ') || 'N/A'}</p>
                <p><strong>Learning:</strong> {user.languagesLearning?.map(l => l.language).join(', ') || 'N/A'}</p>
            </div>
        </div>
    );
};

export default UserProfile;
