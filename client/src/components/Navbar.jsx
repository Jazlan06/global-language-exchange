import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
                    🌐 LangoMate
                </Link>

                {/* Hamburger Button */}
                <button
                    className="sm:hidden focus:outline-none"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden sm:flex gap-6 items-center">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
                            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">Profile</Link>
                            <Link to="/progress" className="text-gray-700 hover:text-blue-600 font-medium">Progress</Link>
                            <button
                                onClick={logout}
                                className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
                            <Link to="/register" className="text-gray-700 hover:text-blue-600 font-medium">Register</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="sm:hidden mt-3 space-y-2 px-2 pb-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
                            <Link to="/profile" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600">Profile</Link>
                            <Link to="/quizzes/progress" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600">Progress</Link>
                            <button
                                onClick={() => {
                                    closeMenu();
                                    logout();
                                }}
                                className="w-full text-left bg-red-500 text-white px-4 py-2 mt-2 rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600">Login</Link>
                            <Link to="/register" onClick={closeMenu} className="block text-gray-700 hover:text-blue-600">Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
