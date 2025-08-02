import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

import UserProfile from '../components/UserProfile.jsx';
import BadgeList from '../components/BadgeList.jsx';
import OnlineFriendsList from '../components/OnlineFriendsList.jsx';
import OnlineUsersList from '../components/OnlineUsersList.jsx';
import PrivacySettingsForm from '../components/PrivacySettingsForm.jsx';
import PreferencesForm from '../components/PreferencesForm.jsx';

const fadeInVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUser(data);
            } catch (err) {
                console.error('❌ Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading)
        return (
            <div className="p-4 text-gray-400 italic text-center font-semibold tracking-wide">
                Loading profile...
            </div>
        );

    if (!user)
        return (
            <div className="p-4 text-red-600 font-bold text-center">
                Failed to load user profile.
            </div>
        );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInVariants}
            className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-pink-50 py-8 px-4 sm:px-8"
        >
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-8 tracking-wide drop-shadow-lg select-none">
                    👤 Your Profile
                </h1>

                {/* Top Section: Profile + Badges */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <UserProfile />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <BadgeList />
                    </div>
                </div>

                {/* Middle Section: Preferences + Privacy Settings */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <PreferencesForm
                            current={{
                                theme: user.theme,
                                notificationPreferences: user.notificationPreferences || {},
                            }}
                        />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <PrivacySettingsForm current={user.privacy || {}} />
                    </div>
                </div>

                {/* Bottom Section: Online Friends + Users */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <OnlineFriendsList />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <OnlineUsersList />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;
