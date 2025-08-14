import axios from 'axios';

const API =  'http://localhost:5000';

const getLessons = async (token) => {
    const res = await axios.get(`${API}/api/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

const getLessonById = async (lessonId, token) => {
    const res = await axios.get(`${API}/api/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

const getProgress = async (token) => {
    const res = await axios.get(`${API}/api/lessons/progress`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

const markLessonComplete = async (lessonId, token) => {
    const res = await axios.post(`${API}/api/lesson/progress/complete`, { lessonId }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export default {
    getLessons,
    getLessonById,
    getProgress,
    markLessonComplete,
};
