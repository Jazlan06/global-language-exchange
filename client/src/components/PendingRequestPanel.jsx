import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingRequestsPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState('');

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/friends/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(data);
        } catch (err) {
            console.error('❌ Error fetching pending requests:', err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const handleAction = async (senderId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/friends/${action}`, { senderId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActionStatus(`✅ Request ${action}ed`);
            setRequests(prev => prev.filter(r => r.sender._id !== senderId));
        } catch (err) {
            console.error(`❌ Failed to ${action} request:`, err);
            setActionStatus(`❌ Failed to ${action}`);
        }

        setTimeout(() => setActionStatus(''), 3000);
    };

    if (loading) return <p className="text-gray-500 italic">Loading pending requests...</p>;
    if (requests.length === 0) return <p className="text-gray-600">You have no pending requests.</p>;

    return (
        <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-semibold mb-4">📥 Pending Friend Requests</h2>

            {actionStatus && (
                <div className="mb-3 text-sm text-green-600">{actionStatus}</div>
            )}

            <ul className="space-y-4">
                {requests.map(({ sender }) => (
                    <li key={sender._id} className="flex justify-between items-center border-b pb-2">
                        <div>
                            <p className="font-medium text-gray-800">{sender.name}</p>
                            <p className="text-sm text-gray-500">{sender.email}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleAction(sender._id, 'accept')}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction(sender._id, 'reject')}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PendingRequestsPanel;
