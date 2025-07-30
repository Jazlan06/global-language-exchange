import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import { useAuth } from './hooks/useAuth.jsx';

export default function App() {
    const { token } = useAuth();
    return (
        <Routes>
            <Route path="/" element={
                token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard"
                element={token ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/lessons/:id" element={token ? <LessonPage /> : <Navigate to="/login" />} />        </Routes>
    );
}
