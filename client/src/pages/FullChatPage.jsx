import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Make sure you have @heroicons/react installed

const FullChatPage = () => {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const highlightedMessageId = searchParams.get('highlight');

  useEffect(() => {
    fetch(`/api/moderation/chat/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load chat messages');
        return res.json();
      })
      .then(data => setMessages(data))
      .catch(() => toast.error('Failed to load chat messages'))
      .finally(() => setLoading(false));
  }, [chatId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🗨️ Full Chat View
        </h1>

        <Link
          to="/admin/flags"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Flags
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500">No messages found in this chat.</p>
      ) : (
        <ul className="space-y-6">
          {messages.map((msg, idx) => {
            const isFlagged = msg._id === highlightedMessageId;

            return (
              <li
                key={msg._id}
                className={`relative group px-5 py-4 rounded-xl max-w-3xl
                  ${
                    isFlagged
                      ? 'border-2 border-red-500 bg-red-50 shadow-lg scale-[1.02]'
                      : 'border border-gray-300 bg-white shadow-sm'
                  }
                  transition-transform hover:shadow-md`}
              >
                {isFlagged && (
                  <span className="absolute top-[-10px] left-3 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    🚩 Flagged
                  </span>
                )}

                <div className="flex justify-between mb-1 text-sm text-gray-700">
                  <span className="font-semibold">{msg.sender?.name || 'Unknown sender'}</span>
                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-gray-900 text-base">{msg.text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FullChatPage;
