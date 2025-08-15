import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SendFriendRequest = () => {
    const [email, setEmail] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    const fetchSuggestions = async () => {
        try {
            const { data } = await axios.get('/api/friends/suggestions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('👀 Suggestions:', data);
            setSuggestions(data);
        } catch (error) {
            console.error('❌ Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (receiverIdOrEmail) => {
        try {
            const payload = receiverIdOrEmail.includes('@')
                ? { email: receiverIdOrEmail }
                : { receiverId: receiverIdOrEmail };

            await axios.post('/api/friends/request', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusMsg('✅ Friend request sent!');
            setEmail('');
            setSuggestions(prev => prev.filter(u => u._id !== receiverIdOrEmail));
        } catch (error) {
            const message = error?.response?.data?.message || 'Could not send request.';
            console.error('❌ Failed to send request:', message);
            setStatusMsg('❌ ' + message);
        }

        setTimeout(() => setStatusMsg(''), 1500);
    }

    useEffect(() => {
        fetchSuggestions()
    }, []);

    return (
        <div className="bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-4">➕ Add a Friend</h2>

            {statusMsg && (
                <div className="mb-4 text-sm text-blue-600">{statusMsg}</div>
            )}


            <div className="flex items-center space-x-2 mb-6">
                <input
                    type="email"
                    placeholder="Enter email"
                    className="border px-3 py-2 rounded w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    onClick={() => handleSendRequest(email)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Send
                </button>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Suggestions</h3>
                {loading ? (
                    <p className="italic text-gray-500">Loading suggestions...</p>
                ) : suggestions.length === 0 ? (
                    <p className="text-gray-600">No suggestions available.</p>
                ) : (
                    <ul className="space-y-3">
                        {suggestions.map((user) => (
                            <li key={user._id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    {user.email && (
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleSendRequest(user._id)}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Send Request
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SendFriendRequest;