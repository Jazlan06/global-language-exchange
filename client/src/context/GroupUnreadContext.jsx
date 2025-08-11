import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../utils/socket';
import axios from 'axios';

const GroupUnreadContext = createContext();

export const useGroupUnread = () => useContext(GroupUnreadContext);

export const GroupUnreadProvider = ({ children }) => {
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token'); // get the token

        if (!token) return; // exit early if no token

        axios.get('/api/groups/unread-counts', {
            headers: {
                Authorization: `Bearer ${token}` // set auth header
            }
        }).then(res => {
            setUnreadCounts(res.data);
        }).catch(err => {
            console.error('Failed to fetch unread counts:', err);
        });

        socket.on('group_unread_update', ({ groupId, count }) => {
            setUnreadCounts(prev => ({
                ...prev,
                [groupId]: (prev[groupId] || 0) + count
            }));
        });

        return () => {
            socket.off('group_unread_update');
        };
    }, []);

    const resetUnread = (groupId) => {
        const token = localStorage.getItem('token');
        axios.post(`/api/groups/${groupId}/mark-read`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setUnreadCounts(prev => ({ ...prev, [groupId]: 0 }));
    };

    return (
        <GroupUnreadContext.Provider value={{ unreadCounts, resetUnread }}>
            {children}
        </GroupUnreadContext.Provider>
    );
};
