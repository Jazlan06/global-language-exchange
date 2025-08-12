import React, { useEffect, useState, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const FlaggedMessagesPage = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ flaggedBy: '', chatId: '' });
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetch('/api/moderation/flagged-messages', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(setFlags)
            .catch(() => toast.error('Failed to load flagged messages'))
            .finally(() => setLoading(false));
    }, []);

    const handleDismiss = async (flagId) => {
        await fetch('/api/moderation/dismiss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ flagId })
        });
        setFlags(prev => prev.filter(f => f._id !== flagId));
        toast.success('Flag dismissed');
    };

    const handleDelete = async (messageId) => {
        await fetch(`/api/moderation/message/${messageId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFlags(prev => prev.filter(f => f.messageId._id !== messageId));
        toast.success('Message deleted');
    };

    const filtered = useMemo(() =>
        flags.filter(f =>
            (!filter.flaggedBy || f.flaggedBy.name.includes(filter.flaggedBy)) &&
            (!filter.chatId || f.messageId.chat.toString() === filter.chatId)
        ),
        [flags, filter]
    );

    const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    const currentItems = useMemo(() => {
        const start = currentPage * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🚩 Flagged Messages</h1>

            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Filter by flagger"
                    value={filter.flaggedBy}
                    onChange={e => setFilter(prev => ({ ...prev, flaggedBy: e.target.value }))}
                    className="border p-2 rounded flex-1"
                />
                <input
                    type="text"
                    placeholder="Filter by Chat ID"
                    value={filter.chatId}
                    onChange={e => setFilter(prev => ({ ...prev, chatId: e.target.value }))}
                    className="border p-2 rounded flex-1"
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filtered.length === 0 ? (
                <p>No flagged messages.</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {currentItems.map(flag => (
                            <li key={flag._id} className="bg-white p-4 border rounded shadow-sm">
                                <div className="text-gray-600"><strong>Flagged By:</strong> {flag.flaggedBy?.name || 'Unknown'}</div>
                                <div className="text-gray-600"><strong>Reason:</strong> {flag.reason}</div>
                                <div className="text-gray-600"><strong>Flagged At:</strong> {new Date(flag.createdAt).toLocaleString()}</div>

                                {flag.messageId ? (
                                    <div className="p-3 bg-gray-50 border rounded mt-2">
                                        <div><strong>Message:</strong> {flag.messageId.text}</div>
                                        <div className="text-sm text-gray-500"><strong>Sender:</strong> {flag.messageId.sender?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500"><strong>Sent At:</strong> {new Date(flag.messageId.createdAt).toLocaleString()}</div>
                                    </div>
                                ) : (
                                    <div className="text-red-500 mt-2">⚠️ Original message not found (possibly deleted)</div>
                                )}

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleDismiss(flag._id)}
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    >Dismiss Flag</button>

                                    {flag.messageId && (
                                        <>
                                            <button
                                                onClick={() => handleDelete(flag.messageId._id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >Delete Message</button>

                                            <Link
                                                to={`/chat/${flag.messageId.chat}?highlight=${flag.messageId._id}`}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                View Full Chat
                                            </Link>

                                        </>
                                    )}
                                </div>
                            </li>
                        ))}

                    </ul>

                    {pageCount > 1 && (
                        <div className="mt-4">
                            <ReactPaginate
                                previousLabel="< Previous"
                                nextLabel="Next >"
                                breakLabel="..."
                                pageCount={pageCount}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                onPageChange={handlePageClick}
                                containerClassName="flex justify-center space-x-2"
                                pageClassName="px-2 py-1 border rounded"
                                activeClassName="font-bold bg-blue-200"
                                previousClassName="px-2 py-1 border rounded"
                                nextClassName="px-2 py-1 border rounded"
                                disabledClassName="opacity-50 cursor-not-allowed"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FlaggedMessagesPage;
