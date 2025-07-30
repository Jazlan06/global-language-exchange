import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth.jsx";
import { Link } from "react-router-dom";

export default function LessonsListPage() {
    const { token } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [progress, setProgress] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lsRes, prRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/lessons", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:5000/api/lesson-progress/completed", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setLessons(lsRes.data);
                setProgress(prRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load lessons.");
            }
        };
        fetchData();
    }, [token]);

    const statusByLesson = {};
    progress.forEach((p) => {
        statusByLesson[p.lesson._id] = p.status;
    });

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">All Lessons</h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <ul className="space-y-4">
                {lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => {
                        const status = statusByLesson[lesson._id] || "locked";
                        return (
                            <li key={lesson._id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {lesson.order}. {lesson.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{lesson.type}</p>
                                </div>
                                <div>
                                    {status === "unlocked" ? (
                                        <Link
                                            to={`/lessons/${lesson._id}`}
                                            className="text-blue-600 underline"
                                        >
                                            Start
                                        </Link>
                                    ) : status === "completed" ? (
                                        <span className="text-green-600 font-semibold">Completed</span>
                                    ) : (
                                        <span className="text-gray-400">Locked</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
