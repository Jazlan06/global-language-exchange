import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function QuizComponent({ quiz }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    const handleChange = (questionIndex, selectedOption) => {
        setAnswers({ ...answers, [questionIndex]: selectedOption });
    };

    const handleSubmit = async () => {
        const formattedAnswers = quiz.questions.map((q, index) => ({
            question: q.question,
            selectedOption: parseInt(answers[index])
        }));

        try {
            const res = await axios.post('/api/quizzes/submit', {
                quizId: quiz._id,
                answers: formattedAnswers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResult(res.data);
            setSubmitted(true);
        } catch (err) {
            console.error('Quiz submission failed:', err);
        }
    };

    if (submitted && result) {
        return (
            <div>
                <h3 className="text-xl font-bold">Quiz Result</h3>
                <p>Score: {result.score} / {result.total}</p>
                <p>{result.passed ? "✅ Passed!" : "❌ Failed"}</p>
                <button onClick={() => navigate('/lessons')} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Back to Lessons</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {quiz.questions.map((q, index) => (
                <div key={index}>
                    <h4 className="font-semibold">{index + 1}. {q.question}</h4>
                    {q.choices.map((choice, i) => (
                        <label key={i} className="block">
                            <input
                                type="radio"
                                name={`q-${index}`}
                                value={i}
                                checked={answers[index] == i}
                                onChange={() => handleChange(index, i)}
                                className="mr-2"
                            />
                            {choice}
                        </label>
                    ))}
                </div>
            ))}

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
            >
                Submit Quiz
            </button>
        </div>
    );
}
