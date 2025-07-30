import { useState } from "react";
import { register } from '../services/authService';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { name, email, password } = formData;
            const data = await register({ name, email, password });
            console.log('Registration successful:', data);
            window.location.href = '/login';
        } catch (err) {
            console.error('Full error object:', err);
            console.error('Error response data:', err.response?.data);

            const msg =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string'
                    ? err.response.data
                    : JSON.stringify(err.response?.data)) ||
                err.message ||
                'Registration failed';

            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-md p-6 w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-4">Register</h2>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full mb-3 px-3 py-2 border rounded"
                />
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
                    className="w-full mb-3 px-3 py-2 border rounded"
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full mb-4 px-3 py-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Registering...' : 'Sign Up'}
                </button>
                <p className="text-sm mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 underline">Login</a>
                </p>
            </form>
        </div>
    )
}