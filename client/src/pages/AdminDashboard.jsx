import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { FiUsers, FiActivity, FiMessageCircle, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');


export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [xpTrends, setXpTrends] = useState([]);
    const [challengeParticipation, setChallengeParticipation] = useState([]);
    const [engagement, setEngagement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const { token } = useAuth();

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const [statsRes, xpRes, challengeRes, engagementRes] = await Promise.all([
                    axios.get('/api/admin/dashboard/stats', config),
                    axios.get('/api/admin/analytics/xp-trends', config),
                    axios.get('/api/admin/analytics/challenge-participation', config),
                    axios.get('/api/admin/analytics/engagement?days=7', config),
                ]);
                setStats(statsRes.data);
                setXpTrends(xpRes.data);
                setChallengeParticipation(challengeRes.data);
                setEngagement(engagementRes.data);
            } catch (error) {
                console.error('Fetch error:', error);
                setLoadError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        socket.on('admin_stats_update', (updatedStats) => {
            console.log('📡 Real-time stats update:', updatedStats);
            setStats((prev) => ({
                ...prev,
                ...updatedStats,
            }));
        });

        return () => {
            socket.off('admin_stats_update');
        };
    }, [token]);

    if (loading) return <div className="p-8 text-center animate-pulse text-lg">Loading admin dashboard...</div>;
    if (loadError) return <div className="p-8 text-red-600">Error: {loadError.message}</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<FiUsers />} />
                <StatCard title="Online Users" value={stats.onlineUsers} icon={<FiActivity />} />
                <StatCard title="Active Today" value={stats.activeToday} icon={<FiActivity />} />
                <StatCard title="Banned Users" value={stats.bannedUsers} icon={<FiAlertCircle />} />
                <StatCard title="Total Chats" value={stats.totalChats} icon={<FiMessageCircle />} />
                <StatCard title="Messages Today" value={stats.messagesToday} icon={<FiMessageCircle />} />
                <StatCard title="Total Messages" value={stats.totalMessages} icon={<FiMessageCircle />} />
                <StatCard title="Calls Today" value={stats.callsToday} icon={<FiPhone />} />
                <StatCard title="Friend Requests" value={stats.totalFriendRequests} icon={<FiUsers />} />
                <StatCard title="Pending Requests" value={stats.pendingFriendRequests} icon={<FiUsers />} />
                <StatCard title="Flagged Messages" value={stats.flaggedMessages} icon={<FiAlertCircle />} />
                <StatCard title="Reported Users" value={stats.reportedUsers} icon={<FiAlertCircle />} />
            </div>

            {/* Top XP Users */}
            <section className="overflow-x-auto bg-white shadow rounded-lg p-4">
                <h2 className="text-2xl font-semibold mb-4">Top XP Users</h2>
                <table className="min-w-full table-auto border">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">XP</th>
                            <th className="py-2 px-4 text-left">Streak</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.topXPUsers.map(user => (
                            <tr key={user.email} className="hover:bg-gray-50 transition">
                                <td className="py-2 px-4">{user.name}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">{user.xp}</td>
                                <td className="py-2 px-4">{user.streak}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">XP Trends (7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={xpTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="xp" stroke="#4f46e5" activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Challenge Participation (7 Days)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={challengeParticipation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#16a34a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Engagement */}
            <section className="bg-white shadow rounded-lg p-6 text-center sm:text-left">
                <h2 className="text-xl font-bold mb-2">User Engagement</h2>
                <p className="text-lg">Active users in the last <strong>{engagement.days}</strong> days: <span className="text-indigo-600 font-bold">{engagement.activeUsers}</span></p>
            </section>
        </div>
    );
}

// 🔥 Animated & Interactive StatCard
function StatCard({ title, value, icon }) {
    return (
        <motion.div
            className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between hover:scale-[1.03] transition-transform"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="text-indigo-600 text-2xl">
                {icon}
            </div>
        </motion.div>
    );
}
