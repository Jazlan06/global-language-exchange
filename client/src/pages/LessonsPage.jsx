import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LessonService from '../services/LessonService';
import { Link } from 'react-router-dom';

export default function LessonsPage() {
    const { token } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [progressMap, setProgressMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonList, progress] = await Promise.all([
                    LessonService.getLessons(token),
                    LessonService.getProgress(token)
                ]);
                setLessons(lessonList);
                const map = {};
                progress.forEach(p => map[p.lesson._id] = p.status);
                setProgressMap(map);
            } catch (err) {
                console.error('Failed to load lessons:', err);
            }
        };
        fetchData();
    }, [token]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Lessons</h2>
            <ul className="space-y-4">
                {lessons.map(lesson => {
                    const status = progressMap[lesson._id] || 'locked';
                    const isAccessible = status !== 'locked';

                    return (
                        <li key={lesson._id} className={`p-4 border rounded ${status === 'completed' ? 'bg-green-100' : status === 'unlocked' ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                            <h3 className="text-lg font-semibold">{lesson.title}</h3>
                            <p>Status: {status}</p>
                            {isAccessible ? (
                                <Link to={`/lessons/${lesson._id}`} className="text-blue-500 underline">View Lesson</Link>
                            ) : (
                                <span className="text-gray-500">Locked</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
