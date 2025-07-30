import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';

const isAuthenticated = false; // 🔒 We'll replace this with real auth later

export default function App() {
    return (
        <Routes>
            <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
                isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />
            } />
        </Routes>
    );
}
