import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";

export default function AdminQuizPage() {
    const { token } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [formData, setFormData] = useState({ title: "", questions: [] });
    const [error, setError] = useState("");

    const headers = { Authorization: `Bearer ${token}` };

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/quizzes", { headers });
            setQuizzes(res.data);
        } catch (err) {
            setError("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const openModal = (quiz = null) => {
        setEditingQuiz(quiz);
        setFormData(
            quiz
                ? {
                    title: quiz.title,
                    questions: quiz.questions.map((q) => ({
                        question: q.question,
                        choices: [...q.choices],
                        correctAnswerIndex: q.correctAnswerIndex,
                    })),
                }
                : { title: "", questions: [] }
        );
        setShowModal(true);
    };

    const handleSave = async () => {
        const url = editingQuiz
            ? `http://localhost:5000/api/quizzes/${editingQuiz._id}`
            : "http://localhost:5000/api/quizzes/create";

        const method = editingQuiz ? "put" : "post";

        try {
            await axios[method](url, formData, { headers });
            setShowModal(false);
            fetchQuizzes();
        } catch (err) {
            console.error(err);
            setError("Failed to save quiz");
        }
    };

    const handleDelete = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/quizzes/${quizId}`, { headers });
            fetchQuizzes();
        } catch (err) {
            console.error(err);
            setError("Failed to delete quiz");
        }
    };

    const addQuestion = () => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                { question: "", choices: ["", "", "", ""], correctAnswerIndex: 0 },
            ],
        }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateChoice = (qIdx, cIdx, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIdx].choices[cIdx] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-700">Admin Quiz Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    + Create Quiz
                </button>
            </div>

            {loading ? (
                <p>Loading quizzes...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className="border border-gray-300 p-4 rounded bg-white shadow-md"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                {quiz.title}
                            </h2>
                            <p className="text-sm text-gray-500 mb-2">
                                {quiz.questions.length} Questions
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openModal(quiz)}
                                    className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(quiz._id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                            {editingQuiz ? "Edit Quiz" : "Create Quiz"}
                        </h2>
                        <input
                            type="text"
                            placeholder="Quiz Title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full mb-4 p-2 border rounded"
                        />
                        {formData.questions.map((q, idx) => (
                            <div
                                key={idx}
                                className="border p-3 mb-4 rounded bg-gray-50"
                            >
                                <input
                                    type="text"
                                    placeholder={`Question ${idx + 1}`}
                                    value={q.question}
                                    onChange={(e) =>
                                        updateQuestion(idx, "question", e.target.value)
                                    }
                                    className="w-full p-2 mb-2 border rounded"
                                />
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {q.choices.map((c, cIdx) => (
                                        <input
                                            key={cIdx}
                                            type="text"
                                            placeholder={`Option ${cIdx + 1}`}
                                            value={c}
                                            onChange={(e) =>
                                                updateChoice(idx, cIdx, e.target.value)
                                            }
                                            className="p-2 border rounded"
                                        />
                                    ))}
                                </div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Correct Answer:
                                    <select
                                        value={q.correctAnswerIndex}
                                        onChange={(e) =>
                                            updateQuestion(
                                                idx,
                                                "correctAnswerIndex",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="block w-full mt-1 p-2 border rounded"
                                    >
                                        {q.choices.map((_, i) => (
                                            <option key={i} value={i}>
                                                Option {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        ))}

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={addQuestion}
                                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                + Add Question
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Save Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}