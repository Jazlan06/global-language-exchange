import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PrivacySettingsForm = ({ current }) => {
    const [privacy, setPrivacy] = useState(current);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => setStatus(''), 1000);
            return () => clearTimeout(timer);
        }
    }, [status]);


    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setPrivacy((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatus('❌ No token found, please login');
                return;
            }

            await axios.put('/api/users/me/privacy', privacy, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStatus('✅ Privacy updated');
        } catch (err) {
            console.error('❌ Privacy update failed:', err);
            setStatus('❌ Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
            <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    name="showEmail"
                    checked={privacy.showEmail}
                    onChange={handleChange}
                    className="form-checkbox"
                />
                <span>Show my email</span>
            </label>

            <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    name="showOnlineStatus"
                    checked={privacy.showOnlineStatus}
                    onChange={handleChange}
                    className="form-checkbox"
                />
                <span>Show when I'm online</span>
            </label>

            <label className="block">
                <span>Profile visible to:</span>
                <select
                    name="profileVisibleTo"
                    value={privacy.profileVisibleTo}
                    onChange={handleChange}
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="everyone">Everyone</option>
                    <option value="friends">Friends</option>
                    <option value="only_me">Only Me</option>
                </select>
            </label>

            <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white px-4 py-2 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
                {loading ? 'Saving...' : 'Save'}
            </button>


            {status && <p className="text-sm text-green-600 mt-2">{status}</p>}
        </form>
    );
};

export default PrivacySettingsForm;
