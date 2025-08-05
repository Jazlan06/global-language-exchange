import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PendingRequestsPanel from '../components/PendingRequestPanel.jsx';
import FriendList from '../components/FriendList.jsx';
import SendFriendRequest from '../components/SendFriendRequest.jsx';
import MutualFriendsPanel from '../components/MutualFriendPanel.jsx';

const FriendsPage = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendingRes, listRes, suggestionsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/friends/pending', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('http://localhost:5000/api/friends/list', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('http://localhost:5000/api/friends/suggestions', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!pendingRes.ok || !listRes.ok || !suggestionsRes.ok) {
                    console.error('❌ One or more requests failed with 401 or 500');
                    return;
                }

                const pendingData = await pendingRes.json();
                const listData = await listRes.json();
                const suggestionsData = await suggestionsRes.json();

                setPendingRequests(pendingData);
                setFriendList(listData);
                setSuggestions(suggestionsData);
            } catch (error) {
                console.error('❌ Error fetching friend data:', error);
            }
        };

        fetchData();
    }, [token]);

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-100 to-white">
            <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
                >
                    <PendingRequestsPanel requests={pendingRequests} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
                >
                    <FriendList friends={friendList} onSelectUser={setSelectedUserId} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow md:col-span-2"
                >
                    <SendFriendRequest suggestions={suggestions} />
                </motion.div>

                <AnimatePresence>
                    {selectedUserId && (
                        <motion.div
                            key="mutual"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow md:col-span-2"
                        >
                            <MutualFriendsPanel targetUserId={selectedUserId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FriendsPage;
