import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function DashboardPage() {
    const { user, lessons, logout, token } = useAuth();
    const navigate = useNavigate();

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
                    <ul>
                        {lessons
                            // 1. Filter out any lessons that have no lesson object or missing _id
                            .filter(lp => lp.lesson && lp.lesson._id)
                            // 2. Map over filtered lessons with stable key based on _id
                            .map((lp) => (
                                <li
                                    key={lp.lesson._id} // stable and unique key
                                    className="p-4 bg-white rounded shadow flex justify-between items-center mb-2"
                                >
                                    <div>
                                        <h3 className="font-medium text-lg">{lp.lesson.title}</h3>
                                        <p className="text-sm text-gray-600">Type: {lp.lesson.type}</p>
                                        <p className="text-sm text-gray-500">Status: {lp.status}</p>
                                    </div>
                                    {lp.status === 'unlocked' && (
                                        <Link
                                            to={`/lessons/${lp.lesson._id}`}
                                            className="text-blue-600 underline"
                                        >
                                            Start
                                        </Link>
                                    )}
                                    {lp.status === 'completed' && (
                                        <span className="text-green-600 font-semibold">Completed</span>
                                    )}
                                    {lp.status === 'locked' && (
                                        <span className="text-gray-400">Locked</span>
                                    )}
                                </li>
                            ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
