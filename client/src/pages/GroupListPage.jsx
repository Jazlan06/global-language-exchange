import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateGroupForm from '../components/CreateGroupForm';
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

    const { unreadCounts } = useGroupUnread();

    if (!rawToken || isTokenExpired || !currentUserId) {
        return (
            <div className="p-6 text-red-600 text-center">
                <p>You must be logged in to view groups.</p>
            </div>
        );
    }

    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!rawToken) {
            console.warn('No auth token found. Redirecting or skipping fetch.');
            return;
        }

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

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
    };

    const handleCreateCancel = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = (result) => {
        setGroups((prevGroups) => [...prevGroups, result.group]);
        setShowCreateModal(false);
    };

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
                    aria-label="Create New Group"
                >
                    + New Group
                </button>
            </div>

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

            {groups.length === 0 ? (
                <p className="text-gray-700 text-center mt-16">You’re not part of any groups yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {groups.map((group) => {
                        const unreadCount = unreadCounts[group._id] || 0;
                        return (
                            <div
                                key={group._id}
                                onClick={() => handleGroupClick(group._id)}
                                className="cursor-pointer bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 ease-in-out relative"
                                title={`Members: ${group.members?.length ?? 0}`}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleGroupClick(group._id)}
                            >
                                <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">{group.name}</h2>
                                <p className="text-sm text-gray-600">
                                    {(group.members?.length ?? 0)} member{(group.members?.length ?? 0) !== 1 && 's'}
                                </p>

                                {unreadCount > 0 && (
                                    <span
                                        className="absolute top-3 right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                                        aria-label={`${unreadCount} unread messages`}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
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
