import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Menu } from '@headlessui/react';
import { toast } from 'react-toastify';

const FriendList = ({ onSelectUser }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportReason, setReportReason] = useState('');
    const [showReportPrompt, setShowReportPrompt] = useState(null);
    const [blockedIds, setBlockedIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [friendsRes, blockedRes] = await Promise.all([
                    axios.get('/api/friends/list', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/user-moderation/blocked', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setFriends(friendsRes.data);
                setBlockedIds(blockedRes.data);
            } catch (err) {
                console.error('❌ Error fetching data:', err);
                toast.error('Failed to load friends.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBlock = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/user-moderation/block', { blockedId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedIds(prev => [...prev, id]);
            toast.success('User blocked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error blocking user.');
        }
    };

    const handleUnblock = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/user-moderation/unblock', { blocked: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedIds(prev => prev.filter(userId => userId !== id));
            toast.success('User unblocked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error unblocking user.');
        }
    };

    const handleReport = async (id) => {
        if (!reportReason.trim()) {
            toast.warn('Please provide a reason.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/user-moderation/report', { reportedId: id, reason: reportReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User reported.');
            setReportReason('');
            setShowReportPrompt(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error reporting user.');
        }
    };

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

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onSelectUser(friend._id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                title="View mutual friends"
                            >
                                <UserGroupIcon className="w-5 h-5" />
                            </button>

                            <Menu as="div" className="relative">
                                <Menu.Button className="text-gray-600 hover:text-black">
                                    <HiOutlineDotsVertical className="w-5 h-5" />
                                </Menu.Button>
                                <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
                                    {blockedIds.includes(friend._id) ? (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleUnblock(friend._id)}
                                                    className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                                                >
                                                    ✅ Unblock
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ) : (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleBlock(friend._id)}
                                                    className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                                                >
                                                    🚫 Block
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setShowReportPrompt(friend._id)}
                                                className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                                            >
                                                🛑 Report
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        </div>
                    </li>
                ))}
            </ul>

            {showReportPrompt && (
                <div className="mt-6 p-4 border bg-red-50 rounded shadow-md">
                    <h3 className="font-semibold text-red-600 mb-2">Report Reason</h3>
                    <textarea
                        rows={3}
                        className="w-full border p-2 rounded"
                        placeholder="Write reason for reporting..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                        <button
                            className="px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
                            onClick={() => {
                                setReportReason('');
                                setShowReportPrompt(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleReport(showReportPrompt)}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendList;
