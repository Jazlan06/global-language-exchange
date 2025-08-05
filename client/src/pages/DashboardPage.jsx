import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, Link } from 'react-router-dom';
import PendingRequestsPanel from '../components/PendingRequestPanel.jsx';
import FriendList from '../components/FriendList.jsx';
import SendFriendRequest from '../components/SendFriendRequest.jsx';
import MutualFriendsPanel from '../components/MutualFriendPanel.jsx';

export default function DashboardPage() {
    const { user, lessons, logout, token } = useAuth();
    const navigate = useNavigate();

    const [selectedUserId, setSelectedUserId] = useState(null); // ✅ added

    useEffect(() => {
        if (!token) navigate('/login');
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Welcome {user?.name || user?.email}
                    </h1>
                </header>

                {/* Lessons Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Your Lesson Progress</h2>
                    {lessons.map((lp) => (
                        <li key={lp.lesson._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-lg">{lp.lesson.title}</h3>
                                <p className="text-sm text-gray-600">Type: {lp.lesson.type}</p>
                                <p className="text-sm text-gray-500">Status: {lp.status}</p>
                            </div>
                            {lp.status === 'unlocked' && (
                                <a href={`/lessons/${lp.lesson._id}`} className="text-blue-600 underline">Start</a>
                            )}
                            {lp.status === 'completed' && (
                                <span className="text-green-600 font-semibold">Completed</span>
                            )}
                            {lp.status === 'locked' && (
                                <span className="text-gray-400">Locked</span>
                            )}
                        </li>
                    ))}
                </section>
            </div>
        </div>
    );
}