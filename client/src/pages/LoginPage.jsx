import { useState } from 'react';
import { login } from '../services/authService';
import { useAuth } from '../hooks/useAuth.jsx';
import { subscribeUserToPush } from '../utils/pushManager';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { login: contextLogin } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(formData.email, formData.password);
            console.log('User role:', data.user.role);
            contextLogin(data);
            await subscribeUserToPush();
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/lessons');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-md p-6 w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-4">Login</h2>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full mb-3 px-3 py-2 border rounded"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 px-3 py-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
                <p className="text-sm mt-4">
                    Don’t have an account? <a href="/register" className="text-blue-600 underline">Register</a>
                </p>
            </form>
        </div>
    );
}
