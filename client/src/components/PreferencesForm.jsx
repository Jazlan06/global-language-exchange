import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PreferencesForm = ({ current }) => {
    const getDefaultPreferences = (data) => ({
        theme: data?.theme || 'light',
        notificationPreferences: {
            email: data?.notificationPreferences?.email ?? false,
            push: data?.notificationPreferences?.push ?? false,
        },
    });

    const [preferences, setPreferences] = useState(getDefaultPreferences(current));
    const [status, setStatus] = useState('');

    // Sync state when `current` changes
    useEffect(() => {
        if (current) {
            setPreferences(getDefaultPreferences(current));
        }
    }, [current]);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => setStatus(''), 1000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;

        if (name.startsWith('notificationPreferences.')) {
            const key = name.split('.')[1];
            setPreferences((prev) => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    [key]: checked,
                },
            }));
        } else {
            setPreferences((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatus('❌ No token found');
                return;
            }

            await axios.put('/api/users/me/preferences', preferences, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            setStatus('✅ Preferences updated');
        } catch (err) {
            console.error('❌ Preferences update failed:', err);
            setStatus('❌ Update failed');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-4 rounded-lg shadow-md"
        >
            <label className="block">
                <span>Theme:</span>
                <select
                    name="theme"
                    value={preferences.theme}
                    onChange={handleChange}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                </select>
            </label>

            <div>
                <span className="block mb-2">Notification Preferences:</span>
                {['email', 'push'].map((key) => (
                    <label key={key} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name={`notificationPreferences.${key}`}
                            checked={preferences.notificationPreferences[key] ?? false}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <span>{key.toUpperCase()}</span>
                    </label>
                ))}
            </div>

            <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
                Save
            </button>

            {status && (
                <div
                    className={`text-sm mt-2 ${
                        status.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {status}
                </div>
            )}
        </form>
    );
};

export default PreferencesForm;
