// client/src/pages/XPPage.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const timeframes = ['daily', 'weekly', 'monthly', 'global'];

export default function XPPage() {
    const [xp, setXp] = useState(null);
    const [leaderboards, setLeaderboards] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('global');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchXPData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [xpRes, lbRes, historyRes] = await Promise.all([
                    fetch('/api/xp/me', { headers }),
                    fetch('/api/xp/full', { headers }),
                    fetch('/api/xp/history', { headers }),
                ]);
                if (!xpRes.ok || !lbRes.ok || !historyRes.ok) throw new Error('Fetch failed');
                setXp(await xpRes.json());
                setLeaderboards(await lbRes.json());
                setHistory(await historyRes.json());
            } catch (err) {
                console.error('Error fetching XP data:', err);
                toast.error('Failed to fetch XP data');
            } finally {
                setLoading(false);
            }
        };

        token ? fetchXPData() : toast.error('Not authenticated');
    }, [token]);

    if (loading) return <div className="p-6 text-center">Loading data...</div>;

    const data = {
        labels: history.reverse().map(e => new Date(e.createdAt).toLocaleDateString()),
        datasets: [
            {
                label: "XP Gained",
                data: history.map(e => e.xp),
                fill: true,
                backgroundColor: 'rgba(59,130,246,0.2)',
                borderColor: 'rgba(59,130,246,0.8)',
                tension: 0.4,
            },
        ],
    };

    const currentLB = leaderboards[selectedTimeframe];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold">XP Dashboard</h1>

            {/* Stats */}
            {xp && (
                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow">
                    <div className="text-center">
                        <p className="text-lg">Total XP</p>
                        <p className="text-2xl font-semibold text-green-600">{xp.xp}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg">Today's XP</p>
                        <p className="text-2xl font-semibold text-blue-600">{xp.xpToday}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg">Streak</p>
                        <p className="text-2xl font-semibold text-orange-600">{xp.streak} days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg">Badge</p>
                        <p className="text-xl">{leaderboards.streakBadge || '—'}</p>
                    </div>
                </div>
            )}

            {/* Timeframe Filter */}
            <div className="flex space-x-2">
                {timeframes.map(tf => (
                    <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-3 py-1 rounded ${selectedTimeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                ))}
            </div>

            {/* Leaderboard Table */}
            {currentLB?.leaderboard && (
                <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                    <h2 className="text-2xl font-semibold mb-2">{selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} Leaderboard</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">#</th>
                                <th className="p-2">User</th>
                                <th className="p-2">XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLB.leaderboard.map(entry => (
                                <tr key={entry.userId} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{entry.rank}</td>
                                    <td className="p-2 flex items-center space-x-2">
                                        <img src={entry.profilePic} alt="" className="w-6 h-6 rounded-full" />
                                        <span>{entry.name}</span>
                                    </td>
                                    <td className="p-2">{entry.value ?? entry.xp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-2 text-gray-600">Your Rank: {currentLB.userRank || 'N/A'}</p>
                </div>
            )}

            {/* XP Progress Chart */}
            {history.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-2">XP Progress Over Time</h2>
                    <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
            )}
        </div>
    );
}
