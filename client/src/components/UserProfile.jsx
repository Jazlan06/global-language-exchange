// client/components/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        profilePic: '',
        languagesKnown: [],
        languagesLearning: [],
    });
    const [imagePreview, setImagePreview] = useState(''); // New state for image preview

    const token = localStorage.getItem('token');

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
                setFormData({
                    name: res.data.name || '',
                    profilePic: res.data.profilePic || '',
                    languagesKnown: res.data.languagesKnown?.map(l => l.language) || [],
                    languagesLearning: res.data.languagesLearning?.map(l => l.language) || [],
                });
                setImagePreview(res.data.profilePic || ''); // Set preview on load
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLanguageListChange = (field, index, value) => {
        setFormData(prev => {
            const updatedList = [...prev[field]];
            updatedList[index] = value;
            return { ...prev, [field]: updatedList };
        });
    };

    const addLanguageField = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeLanguageField = (field, index) => {
        setFormData(prev => {
            const updatedList = [...prev[field]];
            updatedList.splice(index, 1);
            return { ...prev, [field]: updatedList };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        console.log("📸 Selected file:", file);
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                }
            });

            const imageUrl = res.data.url;
            setFormData(prev => ({ ...prev, profilePic: imageUrl }));
            setImagePreview(imageUrl);
        } catch (err) {
            console.error("❌ Upload failed:", err);
            alert("Upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                profilePic: formData.profilePic,
                languagesKnown: formData.languagesKnown
                    .filter(l => l.trim() !== '')
                    .map(l => ({ language: l })),
                languagesLearning: formData.languagesLearning
                    .filter(l => l.trim() !== '')
                    .map(l => ({ language: l })),
            };

            await axios.put('/api/users/me', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setEditing(false);

            // Refresh profile
            const res = await axios.get('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setImagePreview(res.data.profilePic || '');
        } catch (err) {
            console.error('❌ Failed to update profile:', err);
        }
    };

    if (!user) return <div className="animate-pulse text-gray-500">Loading profile...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <div className="flex items-center gap-4">
                <img
                    src={user.profilePic || '/default-avatar.png'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-gray-700">Languages</h3>
                <p><strong>Knows:</strong> {user.languagesKnown?.map(l => l.language).join(', ') || 'N/A'}</p>
                <p><strong>Learning:</strong> {user.languagesLearning?.map(l => l.language).join(', ') || 'N/A'}</p>
            </div>

            <button
                onClick={() => setEditing(true)}
                className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded shadow"
            >
                Edit
            </button>

            {editing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl relative"
                    >
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

                        <label className="block">
                            <span>Name:</span>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </label>

                        {/* Profile Picture Upload Input */}
                        <div>
                            <label className="block mb-1">Upload Profile Picture:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="mb-2"
                            />
                            {imagePreview || formData.profilePic ? (
                                <img
                                    src={imagePreview || formData.profilePic}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                            ) : (
                                <p className="text-sm text-gray-500">No image selected</p>
                            )}
                        </div>

                        {/* Languages Known */}
                        <div>
                            <label className="block mb-1">Languages Known:</label>
                            {formData.languagesKnown.map((lang, idx) => (
                                <div key={idx} className="flex gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={lang}
                                        onChange={(e) => handleLanguageListChange('languagesKnown', idx, e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLanguageField('languagesKnown', idx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addLanguageField('languagesKnown')}
                                className="text-sm text-blue-600 hover:underline mt-1"
                            >
                                + Add
                            </button>
                        </div>

                        {/* Languages Learning */}
                        <div>
                            <label className="block mb-1">Languages Learning:</label>
                            {formData.languagesLearning.map((lang, idx) => (
                                <div key={idx} className="flex gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={lang}
                                        onChange={(e) => handleLanguageListChange('languagesLearning', idx, e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLanguageField('languagesLearning', idx)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addLanguageField('languagesLearning')}
                                className="text-sm text-blue-600 hover:underline mt-1"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
