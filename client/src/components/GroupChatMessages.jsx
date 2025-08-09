import React from 'react';
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

const GroupChatMessage = ({ message }) => {
    const currentUserId = getCurrentUserId();
    const isOwnMessage = message.sender?._id === currentUserId;

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs md:max-w-md p-3 rounded-lg shadow 
                    ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}
            >
                {!isOwnMessage && (
                    <div className="text-sm font-semibold mb-1">
                        {message.sender?.name || 'Unknown'}
                    </div>
                )}
                <div className="break-words">{message.text}</div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

export default GroupChatMessage;