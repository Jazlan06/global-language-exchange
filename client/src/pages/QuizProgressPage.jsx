import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";

export default function QuizProgressPage() {
    const { token } = useAuth();
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [filter, setFilter] = useState("all"); // all, passed, failed
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/quizzes/progress", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProgressData(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load quiz progress");
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, [token]);

    const filteredData = useMemo(() => {
        if (filter === "passed") return progressData.filter((entry) => entry.passed);
        if (filter === "failed") return progressData.filter((entry) => !entry.passed);
        return progressData;
    }, [filter, progressData]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [currentPage, pageSize, filteredData]);

    const goToPage = (pageNum) => {
        if (pageNum < 1) pageNum = 1;
        else if (pageNum > totalPages) pageNum = totalPages;
        setCurrentPage(pageNum);
    };

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500 text-lg animate-pulse">Loading quiz progress...</p>
            </div>
        );
    if (error)
        return (
            <div className="p-4 max-w-2xl mx-auto">
                <p className="text-red-600 font-semibold text-center">{error}</p>
            </div>
        );

    function DetailsModal({ entry, onClose }) {
        if (!entry) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={onClose}
                aria-modal="true"
                role="dialog"
                aria-labelledby="modal-title"
            >
                <div
                    className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto p-8 mx-4 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 id="modal-title" className="text-2xl font-bold mb-6 text-gray-800">
                        Quiz Details
                    </h2>
                    <p className="mb-3 text-gray-700">
                        <span className="font-semibold">Quiz Title:</span> {entry.quiz?.title || "Untitled Quiz"}
                    </p>
                    <p className="mb-6 text-gray-700">
                        <span className="font-semibold">Score:</span> {entry.score} / {entry.total} —{" "}
                        {entry.passed ? (
                            <span className="text-green-600 font-semibold">Passed</span>
                        ) : (
                            <span className="text-red-600 font-semibold">Failed</span>
                        )}
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border border-gray-300 rounded">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 border-b border-gray-300">
                                        Question
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 border-b border-gray-300">
                                        Your Answer
                                    </th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 border-b border-gray-300">
                                        Correct Answer
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 border-b border-gray-300">
                                        Result
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {entry.answers.map((ans, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            ans.selectedOption === ans.correctAnswer
                                                ? "bg-green-50 hover:bg-green-100 transition-colors"
                                                : "bg-red-50 hover:bg-red-100 transition-colors"
                                        }
                                    >
                                        <td className="p-3 max-w-xs truncate text-gray-800">{ans.question}</td>
                                        <td className="p-3 text-gray-700">{ans.selectedOption !== null ? `Option ${ans.selectedOption}` : <em className="text-gray-400">No Answer</em>}</td>
                                        <td className="p-3 text-gray-700">{`Option ${ans.correctAnswer}`}</td>
                                        <td className="p-3 text-center font-bold text-lg">
                                            {ans.selectedOption === ans.correctAnswer ? (
                                                <span className="text-green-700">&#10003;</span>
                                            ) : (
                                                <span className="text-red-700">&#10007;</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-wide">Your Quiz Progress</h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="filter" className="font-semibold text-gray-700">
                        Filter:
                    </label>
                    <select
                        id="filter"
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="font-semibold text-gray-700">
                        Items per page:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(parseInt(e.target.value, 10));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
            </div>

            {filteredData.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No quiz attempts found.</p>
            ) : (
                <table className="w-full border border-gray-300 rounded shadow-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="p-3 border-b border-gray-300 cursor-default">Quiz Title</th>
                            <th className="p-3 border-b border-gray-300 cursor-default">Score</th>
                            <th className="p-3 border-b border-gray-300 cursor-default">Result</th>
                            <th className="p-3 border-b border-gray-300 cursor-default">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((entry) => (
                            <tr
                                key={entry._id}
                                className="border-t hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedEntry(entry)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setSelectedEntry(entry);
                                }}
                            >
                                <td className="p-3 max-w-xs truncate">{entry.quiz?.title || "Untitled Quiz"}</td>
                                <td className="p-3">
                                    {entry.score} / {entry.total}
                                </td>
                                <td className={`p-3 font-semibold ${entry.passed ? "text-green-600" : "text-red-600"}`}>
                                    {entry.passed ? "Passed" : "Failed"}
                                </td>
                                <td className="p-3 text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {filteredData.length > 0 && (
                <nav
                    className="mt-6 flex justify-center items-center space-x-3"
                    aria-label="Pagination Navigation"
                >
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border border-gray-300 ${currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-blue-100 text-blue-700"
                            }`}
                        aria-disabled={currentPage === 1}
                        aria-label="Previous Page"
                    >
                        &laquo; Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 rounded border border-gray-300 ${page === currentPage
                                    ? "bg-blue-600 text-white cursor-default"
                                    : "hover:bg-blue-100 text-blue-700"
                                    }`}
                                aria-current={page === currentPage ? "page" : undefined}
                                aria-label={`Page ${page}`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border border-gray-300 ${currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-blue-100 text-blue-700"
                            }`}
                        aria-disabled={currentPage === totalPages}
                        aria-label="Next Page"
                    >
                        Next &raquo;
                    </button>
                </nav>
            )}

            {selectedEntry && (
                <DetailsModal
                    entry={selectedEntry}
                    onClose={() => setSelectedEntry(null)}
                />
            )}
        </main>
    );
}
