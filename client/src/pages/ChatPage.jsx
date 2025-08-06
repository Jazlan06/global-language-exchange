import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { jwtDecode } from 'jwt-decode';
import {
    getChats,
    getMessages,
    sendMessage,
    createOrGetChat
} from '../utils/api';
import socket from '../utils/socket';
import { v4 as uuidv4 } from 'uuid';

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

const ChatPage = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userList, setUserList] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const currentUserId = getCurrentUserId();
    const typingTimeoutRef = useRef(null);
    const typingEmitTimeoutRef = useRef(null);
    const typingDisplayTimeoutRef = useRef(null);

    useEffect(() => {
        socket.connect();
        socket.emit('join', localStorage.getItem('token'));

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!selectedChat || !newMessage) return;

        const recipient = selectedChat.participants.find(p => p._id !== currentUserId);
        if (!recipient) return;

        socket.emit('user_typing', {
            chatId: selectedChat._id,
            to: recipient._id,
        });

        if (typingEmitTimeoutRef.current) clearTimeout(typingEmitTimeoutRef.current);
        typingEmitTimeoutRef.current = setTimeout(() => {
            socket.emit('user_typing_stop', {
                chatId: selectedChat._id,
                to: recipient._id,
            });
        }, 1000);
    }, [newMessage]);

    useEffect(() => {
        const handleTyping = ({ chatId, from }) => {
            if (chatId === selectedChat?._id && from !== currentUserId) {
                setIsTyping(true);

                if (typingDisplayTimeoutRef.current) clearTimeout(typingDisplayTimeoutRef.current);
                typingDisplayTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
            }
        };

        const handleStopTyping = ({ chatId, from }) => {
            if (chatId === selectedChat?._id && from !== currentUserId) {
                setIsTyping(false);
            }
        };

        socket.on('user_typing', handleTyping);
        socket.on('user_typing_stop', handleStopTyping);

        return () => {
            socket.off('user_typing', handleTyping);
            socket.off('user_typing_stop', handleStopTyping);
        };
    }, [selectedChat]);

    useEffect(() => {
        socket.on('receive_message', (msg) => {
            if (msg.chatId === selectedChat?._id) {
                const normalizedMsg = {
                    _id: uuidv4(),
                    chat: msg.chatId,
                    text: msg.text,
                    createdAt: msg.createdAt,
                    sender: msg.from,
                };
                setMessages(prev => [...prev, normalizedMsg]);
            } else {
                setUnreadCounts(prev => ({
                    ...prev,
                    [msg.chatId]: (prev[msg.chatId] || 0) + 1
                }));
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [selectedChat]);

    useEffect(() => {
        getChats().then(data => data && setChats(data));

        fetch('/api/users/list', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(r => r.json())
            .then(data => {
                console.log('Fetched userList:', data);
                setUserList(data);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!selectedChat) return setMessages([]);
        getMessages(selectedChat._id).then(ms => ms && setMessages(ms));
    }, [selectedChat]);

    const handleStartChat = (userId) => {
        console.log('Starting chat with userId:', userId);
        createOrGetChat(userId).then(chat => {
            if (chat) {
                getChats().then(c => {
                    setChats(c);
                    setSelectedChat(chat);
                    setSidebarVisible(false);
                    setUnreadCounts(prev => {
                        const newCounts = { ...prev };
                        delete newCounts[chat._id];
                        return newCounts;
                    });
                });
            }
        });
    };

    const filtered = searchTerm
        ? userList.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            u._id !== currentUserId
        )
        : [];

    const swipeHandlers = useSwipeable({
        onSwipedRight: () => setSidebarVisible(true),
        onSwipedLeft: () => setSidebarVisible(false),
        preventScrollOnSwipe: true,
        trackTouch: true
    });

    return (
        <div className="flex h-screen w-screen bg-gray-100" {...swipeHandlers}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform transition-transform duration-300
                ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static`}>
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Your Chats</h2>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Search name..."
                        className="w-full px-3 py-2 border rounded-md focus:ring focus:border-blue-300"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {filtered.length > 0 && (
                        <ul className="border mt-1 max-h-40 overflow-y-auto bg-white rounded">
                            {filtered.map(u => (
                                <li
                                    key={u._id}
                                    onClick={() => handleStartChat(u._id)}
                                    className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                                >
                                    {u.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <ul className="overflow-y-auto p-4 space-y-2 h-[calc(100vh-200px)]">
                    {chats.map(chat => (
                        <li
                            key={chat._id}
                            onClick={() => {
                                setSelectedChat(chat);
                                setSidebarVisible(false);
                                setUnreadCounts(prev => {
                                    const newCounts = { ...prev };
                                    delete newCounts[chat._id];
                                    return newCounts;
                                });
                            }}
                            className={`cursor-pointer p-2 rounded hover:bg-blue-100 ${
                                selectedChat?._id === chat._id ? 'bg-blue-200 font-semibold' : ''
                            } flex justify-between items-center`}
                        >
                            <span>
                                Chat with {chat.participants
                                    ?.filter(u => u._id !== currentUserId)
                                    .map(u => u.name).join(', ') || 'User'}
                            </span>

                            {unreadCounts[chat._id] > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                                    {unreadCounts[chat._id]}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Overlay */}
            {sidebarVisible && (
                <div
                    className="fixed inset-0 bg-black opacity-25 z-20 md:hidden"
                    onClick={() => setSidebarVisible(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col md:ml-64">
                <div className="p-4 border-b bg-white flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Messages</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {!selectedChat
                        ? <p className="text-gray-500">Swipe from left edge to open chats.</p>
                        : messages.length === 0
                            ? <p className="text-gray-500">No messages yet.</p>
                            : messages.map(msg => (
                                <div
                                    key={msg._id || uuidv4()}
                                    className={`max-w-[70%] p-3 rounded-lg ${msg.sender && msg.sender._id === currentUserId
                                        ? 'bg-blue-600 text-white self-end ml-auto'
                                        : 'bg-white border text-gray-800'
                                        }`}
                                >
                                    <div className="font-semibold">{msg.sender?.name || 'Unknown'}</div>
                                    <div>{msg.text}</div>
                                </div>
                            ))}
                </div>
                {isTyping && (
                    <div className="flex gap-1 items-center p-2 bg-gray-200 rounded-full w-fit">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]" />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                )}

                {selectedChat && (
                    <div className="p-4 border-t bg-white flex gap-2">
                        <input
                            type="text"
                            placeholder="Type message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 px-3 py-2 border rounded-md focus:ring focus:border-blue-300"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    function handleSendMessage() {
        if (!newMessage.trim()) return;

        socket.emit('send_message', {
            chatId: selectedChat._id,
            text: newMessage.trim(),
        });

        setNewMessage('');
        socket.emit('user_typing_stop', {
            chatId: selectedChat._id,
            to: selectedChat.participants.find(p => p._id !== currentUserId)?._id,
        });
    }
};

export default ChatPage;
