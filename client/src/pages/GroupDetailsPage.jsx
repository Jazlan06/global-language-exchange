import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';
import GroupMessageBox from '../components/GroupMessageBox';
import GroupChatMessage from '../components/GroupChatMessages';
import { useGroupUnread } from '../context/GroupUnreadContext';
import { fetchGroupDetails } from '../services/groupService';
import { jwtDecode } from 'jwt-decode';

const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.id || decoded._id;
    } catch {
        return null;
    }
};

const GroupDetailsPage = () => {
    const { id: groupId } = useParams();
    const [messages, setMessages] = useState([]);
    const [groupInfo, setGroupInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const typingTimeoutRef = useRef(null);
    const currentUserId = getCurrentUserId();
    const messagesEndRef = useRef(null);
    const { resetUnread } = useGroupUnread();
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        socket.connect();

        socket.emit('join', localStorage.getItem('token'));

        socket.once('connect', () => {
            socket.emit('join_group', { groupId });
        });

        socket.on('joined_success', () => {
            setJoined(true);
        });

        return () => {
            socket.disconnect();
        };
    }, [groupId]);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const handleGroupMessage = (msg) => {
            if (msg.groupId !== groupId && Notification.permission === 'granted') {
                const senderName = msg.sender?.name || 'New Group Message';
                new Notification(senderName, {
                    body: msg.text,
                    icon: '/chat-icon.png',
                });
            }

            if (msg.groupId === groupId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        text: msg.text,
                        sender: msg.sender,
                        createdAt: msg.createdAt,
                    },
                ]);
            }
        };

        socket.on('group_message', handleGroupMessage);
        return () => {
            socket.off('group_message', handleGroupMessage);
        };
    }, [groupId]);

    useEffect(() => {
        if (!groupInfo) return;

        const handleTyping = ({ groupId: gId, userId }) => {
            if (gId !== groupInfo._id || userId === currentUserId) return;
            setTypingUsers((prev) => [...new Set([...prev, userId])]);
        };

        const handleTypingStop = ({ groupId: gId, userId }) => {
            if (gId !== groupInfo._id || userId === currentUserId) return;
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
        };

        socket.on('group_typing', handleTyping);
        socket.on('group_typing_stop', handleTypingStop);

        return () => {
            socket.off('group_typing', handleTyping);
            socket.off('group_typing_stop', handleTypingStop);
        };
    }, [groupInfo, currentUserId]);

    useEffect(() => {
        if (!groupInfo || newMessage === '') return;

        socket.emit('group_typing', { groupId: groupInfo._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('group_typing_stop', { groupId: groupInfo._id });
        }, 1000);
    }, [newMessage, groupInfo]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchGroupDetails(groupId);
            if (data) {
                setGroupInfo(data.group);
                setMessages(data.messages);
                resetUnread(groupId);
            }
            setLoading(false);
        };
        load();

        socket.connect();
        socket.emit('join', localStorage.getItem('token'));

        return () => {
            socket.disconnect();
        };
    }, [groupId]);

    useEffect(() => {
        const handleFocus = () => {
            resetUnread(groupId);
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [groupId]);

    useEffect(() => {
        if (!groupId) return;

        if (socket.connected) {
            socket.emit('join_group', { groupId });
        } else {
            socket.once('connect', () => {
                socket.emit('join_group', { groupId });
            });
        }

        return () => {
            socket.emit('leave_group', { groupId });
        };
    }, [groupId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = (messageText) => {
        if (!messageText.trim()) return;
        socket.emit('send_group_msg', {
            groupId,
            text: messageText,
        });
        setNewMessage('');
    };

    const handlePromote = async (userIdToAdd) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/addAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userIdToAdd }),
            });
            if (!res.ok) throw new Error('Failed to promote admin');
            const updated = await fetchGroupDetails(groupId);
            setGroupInfo(updated.group);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleDemote = async (userIdToRemove) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/removeAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userIdToRemove }),
            });
            if (!res.ok) throw new Error('Failed to remove admin');
            const updated = await fetchGroupDetails(groupId);
            setGroupInfo(updated.group);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleRemove = async (userIdToRemove) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId: userIdToRemove }),
            });
            if (!res.ok) throw new Error('Failed to remove user');
            const updated = await fetchGroupDetails(groupId);
            setGroupInfo(updated.group);
        } catch (err) {
            console.error(err.message);
        }
    };

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            const res = await fetch(`/api/groups/${groupId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userId: memberToRemove._id }),
            });
            if (!res.ok) throw new Error('Failed to remove user');
            const updated = await fetchGroupDetails(groupId);
            setGroupInfo(updated.group);
            setShowConfirmModal(false);
            setMemberToRemove(null);
        } catch (err) {
            console.error(err.message);
        }
    };

    const cancelRemove = () => {
        setShowConfirmModal(false);
        setMemberToRemove(null);
    };

    return (
        <div className="flex h-screen bg-gradient-to-tr from-purple-50 via-white to-blue-50">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r w-72 p-6 z-20 fixed top-0 left-0 h-full shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out
                    ${showMembers ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:static md:shadow-none`}
                aria-label="Group Members Sidebar"
            >
                <h2 className="text-xl font-semibold mb-6 text-gray-900 select-none">Group Members</h2>

                {groupInfo?.members?.length > 0 ? (
                    <>
                        <input
                            type="search"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full mb-5 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                            aria-label="Search group members"
                        />

                        <ul className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
                            {groupInfo.members
                                .filter((member) =>
                                    member.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((member) => {
                                    const isAdmin = groupInfo.admins.some((admin) => admin._id === member._id);
                                    const isSelf = currentUserId === member._id;

                                    return (
                                        <li
                                            key={member._id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 transition cursor-default"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className={`w-3 h-3 rounded-full ${isSelf ? 'bg-green-500' : 'bg-gray-400'}`}
                                                    title={isSelf ? 'You' : 'Member online'}
                                                />
                                                <span
                                                    className="text-gray-800 font-medium select-text"
                                                    title={`${member.name}${isSelf ? ' (You)' : ''}${isAdmin ? ' (Admin)' : ''}`}
                                                >
                                                    {member.name} {isSelf && '(You)'} {isAdmin && '(Admin)'}
                                                </span>
                                            </div>

                                            {!isSelf && groupInfo.admins.some((a) => a._id === currentUserId) && (
                                                <div className="flex space-x-2 text-xs">
                                                    {!isAdmin ? (
                                                        <button
                                                            onClick={() => handlePromote(member._id)}
                                                            className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                                                            aria-label={`Promote ${member.name} to admin`}
                                                        >
                                                            Promote
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDemote(member._id)}
                                                            className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
                                                            aria-label={`Demote ${member.name} from admin`}
                                                        >
                                                            Demote
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setShowConfirmModal(true);
                                                            setMemberToRemove(member);
                                                        }}
                                                        className="px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
                                                        aria-label={`Remove ${member.name} from group`}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                        </ul>
                    </>
                ) : (
                    <p className="text-gray-500 select-none">No members found.</p>
                )}
            </aside>

            {/* Main Chat Panel */}
            <main className="flex-1 flex flex-col ml-0 md:ml-72">
                {/* Header */}
                <header className="bg-white border-b px-8 py-4 shadow flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-2xl font-semibold text-gray-900 select-none">
                        {groupInfo?.name || 'Group Chat'}
                    </h1>
                    <button
                        onClick={() => setShowMembers(!showMembers)}
                        className="md:hidden bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label={showMembers ? 'Hide Members Sidebar' : 'Show Members Sidebar'}
                    >
                        {showMembers ? 'Hide Members' : 'Show Members'}
                    </button>
                </header>

                {/* Chat Messages */}
                <section className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gradient-to-b from-white to-indigo-50">
                    {loading ? (
                        <p className="text-center text-gray-400 select-none">Loading messages...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-gray-500 select-none">No messages yet.</p>
                    ) : (
                        messages.map((msg, idx) => <GroupChatMessage key={idx} message={msg} />)
                    )}
                    {typingUsers.length > 0 && (
                        <div className="p-2 text-sm text-gray-500">
                            {typingUsers
                                .map((id) => groupInfo?.members.find((u) => u._id === id)?.name || 'Someone')
                                .join(', ')}{' '}
                            typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </section>

                {/* Message Input */}
                <footer className="bg-white border-t px-8 py-4 shadow">
                    <GroupMessageBox message={newMessage} setMessage={setNewMessage} onSend={handleSendMessage} />
                </footer>
            </main>

            {/* Confirm Remove Modal */}
            {showConfirmModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="remove-member-title"
                >
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6 space-y-4 animate-fadeIn">
                        <h2
                            id="remove-member-title"
                            className="text-xl font-semibold text-gray-900 select-none"
                        >
                            Remove Member
                        </h2>
                        <p className="text-gray-700 select-text">
                            Are you sure you want to remove{' '}
                            <span className="font-medium">{memberToRemove?.name}</span> from the group?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={cancelRemove}
                                className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveMember}
                                className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetailsPage;
