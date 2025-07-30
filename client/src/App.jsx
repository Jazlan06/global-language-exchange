import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

const isAuthenticated = false;

export default function App() {
    return (
        <Routes>
            <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    )
}