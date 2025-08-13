import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function AdminLessonPage() {
    const { token } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        type: "text",
        content: "",
        quizId: "",
        order: 0,
        prerequisites: []
    });
    const [error, setError] = useState("");

    const headers = { Authorization: `Bearer ${token}` };

    const fetchLessons = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/lessons", { headers });
            setLessons(res.data);
        } catch (err) {
            console.error("Failed to fetch lessons", err);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/quizzes", { headers });
            setQuizzes(res.data);
        } catch (err) {
            console.error("Failed to fetch quizzes", err);
        }
    };

    useEffect(() => {
        Promise.all([fetchLessons(), fetchQuizzes()]).finally(() => setLoading(false));
    }, []);

    const openModal = (lesson = null) => {
        setEditingLesson(lesson);
        setFormData(
            lesson
                ? {
                      title: lesson.title,
                      type: lesson.type,
                      content: lesson.content || "",
                      quizId: lesson.quiz?._id || "",
                      order: lesson.order,
                      prerequisites: lesson.prerequisites?.map(p => p._id) || []
                  }
                : {
                      title: "",
                      type: "text",
                      content: "",
                      quizId: "",
                      order: lessons.length + 1,
                      prerequisites: []
                  }
        );
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                quizId: formData.type === "quiz" ? formData.quizId : null,
            };

            if (!formData.title.trim()) {
                setError("Title is required.");
                return;
            }

            const url = editingLesson
                ? `http://localhost:5000/api/lessons/${editingLesson._id}`
                : "http://localhost:5000/api/lessons";

            const method = editingLesson ? "put" : "post";

            await axios[method](url, payload, { headers });
            setShowModal(false);
            fetchLessons();
        } catch (err) {
            console.error("Failed to save lesson", err);
            setError("Failed to save lesson");
        }
    };

    const handleDelete = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/lessons/${lessonId}`, { headers });
            fetchLessons();
        } catch (err) {
            console.error("Failed to delete lesson", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-700">Admin Lesson Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    + Create Lesson
                </button>
            </div>

            {loading ? (
                <p>Loading lessons...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                            <div key={lesson._id} className="border p-4 bg-white rounded shadow">
                                <h2 className="text-xl font-semibold">{lesson.title}</h2>
                                <p className="text-gray-500">Type: {lesson.type}</p>
                                <p className="text-gray-500">Order: {lesson.order}</p>
                                {lesson.quiz && (
                                    <p className="text-sm text-gray-600">
                                        Linked Quiz: {lesson.quiz.title}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => openModal(lesson)}
                                        className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lesson._id)}
                                        className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600"
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
                    <div className="bg-white p-6 rounded w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                            {editingLesson ? "Edit Lesson" : "Create Lesson"}
                        </h2>
                        {error && <p className="text-red-600 mb-2">{error}</p>}
                        <input
                            type="text"
                            placeholder="Lesson Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 mb-3 border rounded"
                        />
                        <label className="block mb-2 font-medium">Lesson Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full p-2 mb-3 border rounded"
                        >
                            <option value="text">Text</option>
                            <option value="audio">Audio</option>
                            <option value="quiz">Quiz</option>
                        </select>

                        {formData.type === "quiz" && (
                            <>
                                <label className="block mb-2 font-medium">Select Quiz</label>
                                <select
                                    value={formData.quizId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, quizId: e.target.value })
                                    }
                                    className="w-full p-2 mb-3 border rounded"
                                >
                                    <option value="">-- Select Quiz --</option>
                                    {quizzes.map((quiz) => (
                                        <option key={quiz._id} value={quiz._id}>
                                            {quiz.title}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {(formData.type === "text" || formData.type === "audio") && (
                            <textarea
                                placeholder="Lesson Content"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                className="w-full p-2 mb-3 border rounded min-h-[100px]"
                            />
                        )}

                        <label className="block mb-2 font-medium">Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) =>
                                setFormData({ ...formData, order: parseInt(e.target.value) })
                            }
                            className="w-full p-2 mb-3 border rounded"
                        />

                        <label className="block mb-2 font-medium">Prerequisites</label>
                        <select
                            multiple
                            value={formData.prerequisites}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    prerequisites: Array.from(
                                        e.target.selectedOptions,
                                        (option) => option.value
                                    )
                                })
                            }
                            className="w-full p-2 mb-4 border rounded"
                        >
                            {lessons.map((lesson) => (
                                <option key={lesson._id} value={lesson._id}>
                                    {lesson.title}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-between">
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
                                Save Lesson
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
