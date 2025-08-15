import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateGroupForm from '../components/CreateGroupForm';
import GroupCard from '../components/GroupCard';
import { useGroupUnread } from '../context/GroupUnreadContext';

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

const GroupListPage = () => {
    const rawToken = localStorage.getItem('token');
    const decodedToken = rawToken ? parseJwt(rawToken) : null;
    const isTokenExpired = decodedToken?.exp * 1000 < Date.now();
    const currentUserId = decodedToken?.id || null;

    const userLearningLangs = decodedToken?.languagesLearning?.map(l => l.language) || [];
    const userKnownLangs = decodedToken?.languagesKnown?.map(l => l.language) || [];

    const { unreadCounts } = useGroupUnread();

    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (!rawToken) return;

        const fetchGroups = async () => {
            try {
                const res = await fetch('/api/groups', {
                    headers: {
                        Authorization: `Bearer ${rawToken}`,
                    },
                });

                if (!res.ok) throw new Error(`Failed to fetch groups: ${res.statusText}`);
                const data = await res.json();
                setGroups(data.groups || []);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchGroups();
    }, [rawToken]);

    useEffect(() => {
        console.log('Groups from backend:', groups);
    }, [groups]);

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    const handleCreateClick = () => setShowCreateModal(true);
    const handleCreateCancel = () => setShowCreateModal(false);
    const handleCreateSuccess = (result) => {
        setGroups((prevGroups) => [...prevGroups, result.group]);
        setShowCreateModal(false);
    };
    //Stop Here , just filters not working

    const filteredGroups = groups.filter(group => {
        if (filterType === 'learning') return group.matchRole === 'learning';
        if (filterType === 'can_help') return group.matchRole === 'can_help';
        return true; // 'all'
    });

    if (!rawToken || isTokenExpired || !currentUserId) {
        return (
            <div className="p-6 text-red-600 text-center">
                <p>You must be logged in to view groups.</p>
            </div>
        );
    }

    return (
        <div
            className="p-6 max-w-5xl mx-auto min-h-screen"
            style={{
                background:
                    'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 25%, #E0C3FC 50%, #FFE29F 75%, #FFDEE9 100%)',
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-semibold text-gray-900 tracking-wide">Your Groups</h1>
                <button
                    onClick={handleCreateClick}
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-medium shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                    + New Group
                </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
                <label className="text-gray-800 font-medium">Filter by:</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border px-3 py-1 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300"
                >
                    <option value="all">All</option>
                    <option value="learning">You're Learning</option>
                    <option value="can_help">You Can Help</option>
                </select>
            </div>

            {filteredGroups.length === 0 ? (
                <p className="text-gray-700 text-center mt-16">No matching groups found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <GroupCard
                            key={group._id}
                            group={group}
                            unreadCount={unreadCounts[group._id] || 0}
                            onClick={() => handleGroupClick(group._id)}
                            userLearningLangs={userLearningLangs}
                            userKnownLangs={userKnownLangs}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
                        <CreateGroupForm
                            userId={currentUserId}
                            onCreate={handleCreateSuccess}
                            onCancel={handleCreateCancel}
                        />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease forwards;
                }
            `}</style>
        </div>
    );
};

export default GroupListPage;
