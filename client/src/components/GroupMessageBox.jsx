import React, { useState } from 'react';

const GroupMessageBox = ({ onSend, message, setMessage }) => {
    const handleSend = () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        onSend(trimmed);
        setMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t bg-white flex gap-2">
            <textarea
                className="flex-1 px-3 py-2 border rounded-md focus:ring focus:border-blue-300 resize-none"
                rows="1"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Send
            </button>
        </div>
    );
};

export default GroupMessageBox;