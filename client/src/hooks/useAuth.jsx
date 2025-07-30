import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user')
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || null)
    const [lessons, setLessons] = useState(() => {
        const stored = localStorage.getItem('lessonProgress');
        return stored ? JSON.parse(stored) : [];
    })

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    useEffect(() => {
        if (lessons) {
            localStorage.setItem('lessonProgress', JSON.stringify(lessons));
        }
    }, [lessons]);

    const login = (authData) => {
        setUser(authData.user);
        setToken(authData.token);
        setLessons(authData.lessonProgress);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setLessons([]);
        localStorage.clear();
        window.location.href = '/login';
    }

    return (
        <AuthContext.Provider value={{ user, token, lessons, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}