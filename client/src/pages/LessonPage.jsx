import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";
import { toast } from "react-toastify";

export default function LessonPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [lesson, setLesson] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/lessons/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLesson(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load lesson');
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [id, token]);

    const handleOptionChange = (question, choiceIndex) => {
        setSelectedOptions(prev => ({
            ...prev,
            [question]: choiceIndex
        }));
    };

    const handleSubmit = async () => {
        if (!lesson?.quiz?._id) return;

        setSubmitting(true);
        try {
            const answers = lesson.quiz.questions.map(q => ({
                question: q.question,
                selectedOption: selectedOptions[q.question] ?? null
            }));

            const res = await axios.post('http://localhost:5000/api/quizzes/submit', {
                quizId: lesson.quiz._id,
                answers
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.passed) {
                toast.success("You passed the quiz! 🎉 Lesson completed and XP awarded.");

                await axios.post('http://localhost:5000/api/lesson/progress/complete', {
                    lessonId: lesson._id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            } else {
                toast.error("You didn’t pass the quiz. Try again!");
            }

        } catch (err) {
            console.error('Error submitting quiz:', err);
            toast.error("Something went wrong submitting the quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="p-4">Loading lesson...</p>;
    if (error) return <p className="p-4 text-red-600">{error}</p>;
    if (!lesson) return null;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
            <p className="mb-2 text-gray-600">Type: {lesson.type}</p>

            {lesson.type === 'text' && (
                <div className="bg-white p-4 rounded shadow">
                    <p>{lesson.content}</p>
                </div>
            )}

            {lesson.type === 'quiz' && (
                Array.isArray(lesson.quiz?.questions) ? (
                    <div className="space-y-6">
                        {lesson.quiz.questions.map((q, index) => (
                            <div key={index} className="bg-white p-4 rounded shadow">
                                <h3 className="font-semibold mb-2">{q.question}</h3>
                                <div className="space-y-1">
                                    {q.choices.map((choice, i) => (
                                        <label key={i} className="block">
                                            <input
                                                type="radio"
                                                name={q.question}
                                                value={i}
                                                checked={selectedOptions[q.question] === i}
                                                onChange={() => handleOptionChange(q.question, i)}
                                                className="mr-2"
                                            />
                                            {choice}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            {submitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    </div>
                ) : (
                    <p className="text-yellow-600">Quiz not yet available or malformed.</p>
                )
            )}


            {lesson.type === 'audio' && (
                <div>
                    <p className="text-blue-600">Audio lesson coming soon.</p>
                </div>
            )}
        </div>
    );
}
