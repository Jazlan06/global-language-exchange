import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonService from '../services/LessonService';
import { useAuth } from '../hooks/useAuth';
import QuizComponent from '../components/QuizComponent';

export default function LessonDetailPage() {
    const { token } = useAuth();
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const data = await LessonService.getLessonById(lessonId, token);
                setLesson(data);
            } catch (err) {
                console.error('Failed to load lesson:', err);
            }
        };
        fetchLesson();
    }, [lessonId, token]);

    const handleComplete = async () => {
        try {
            await LessonService.markLessonComplete(lessonId, token);
            alert('Lesson completed!');
            navigate('/lessons');
        } catch (err) {
            console.error('Error completing lesson:', err);
        }
    };

    if (!lesson) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
            {lesson.type === 'text' && (
                <>
                    <div className="prose mb-6">{lesson.content}</div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleComplete}
                    >
                        Mark as Complete
                    </button>
                </>
            )}

            {lesson.type === 'quiz' && lesson.quiz && (
                <QuizComponent quiz={lesson.quiz} />
            )}
        </div>
    );
}
