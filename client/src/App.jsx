import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import QuizProgressPage from './pages/QuizProgressPage.jsx';
import AdminQuizPage from "./pages/AdminQuizPage.jsx";
import ProfilePage from './pages/ProfilePage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import GroupListPage from './pages/GroupListPage.jsx';
import GroupDetailsPage from './pages/GroupDetailsPage.jsx';
import IncomingCallHandler from './pages/IncomingCallHandler.jsx';
import CallPage from './pages/CallPage.jsx';
import CallReceiverPage from './pages/CallReceiverPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FlaggedMessagesPage from './pages/FlaggedMessagesPage.jsx';
import FullChatPage from './pages/FullChatPage.jsx';
import AdminLessonPage from './pages/AdminLessonPage.jsx';
import LessonsPage from './pages/LessonsPage.jsx';
import LessonDetailPage from './pages/LessonDetailPage.jsx';
import XPPage from './pages/XPPage.jsx';
import { useAuth } from './hooks/useAuth.jsx';

export default function App() {
    const { token, user } = useAuth();
    return (
        <>
            <Routes>
                <Route path="/" element={
                    token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard"
                    element={token ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path="/xp" element={token ? <XPPage /> : <Navigate to="/login" />} />
                <Route
                    path="/quizzes/progress"
                    element={token ? <QuizProgressPage /> : <Navigate to="/login" />}
                />
                <Route path="/admin/dashboard" element={token ? <AdminDashboard /> : <Navigate to="/login" />} />
                <Route path="/admin/flags" element={token ? <FlaggedMessagesPage /> : <Navigate to="/login" />} />
                <Route path="/admin/lessons" element={token ? <AdminLessonPage /> : <Navigate to="/login" />} />
                <Route path="/lessons" element={token ? <LessonsPage /> : <Navigate to="/login" />} />
                <Route path="/lessons/:lessonId" element={token ? <LessonDetailPage /> : <Navigate to="/login" />} />
                <Route path="/chat/:chatId" element={token ? <FullChatPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/quizzes" element={<AdminQuizPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/groups" element={token ? <GroupListPage /> : <Navigate to="/login" />} />
                <Route path="/groups/:id" element={token ? <GroupDetailsPage /> : <Navigate to="/login" />} />
                <Route path="/call/:chatId" element={token ? <CallPage /> : <Navigate to="/login" />} />
                <Route path="/call/:chatId" element={token ? <CallPage /> : <Navigate to="/login" />} />
                <Route path="/call/:chatId/receive" element={token ? <CallReceiverPage /> : <Navigate to="/login" />} />
            </Routes>
            {token && user && <IncomingCallHandler currentUser={user} />}
        </>
    );
}
