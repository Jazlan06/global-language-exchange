const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
});

export const fetchGroupDetails = async (groupId) => {
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}`, {
            headers: headers()
        });
        if (!res.ok) throw new Error('Failed to fetch group details');
        return await res.json(); 
    } catch (err) {
        console.error('[fetchGroupDetails]', err.message);
        return null;
    }
};

export const sendGroupMessage = async (groupId, message) => {
    try {
        const res = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ text: message })
        });

        if (!res.ok) throw new Error('Failed to send group message');
        return await res.json();
    } catch (err) {
        console.error('[sendGroupMessage]', err.message);
        return null;
    }
};

export const fetchUserGroups = async () => {
    try {
        const res = await fetch(`${API_BASE}/groups`, {
            headers: headers()
        });
        if (!res.ok) throw new Error('Failed to fetch groups');
        return await res.json(); 
    } catch (err) {
        console.error('[fetchUserGroups]', err.message);
        return [];
    }
};

export const createGroup = async (groupName, participantIds) => {
    try {
        const res = await fetch(`${API_BASE}/groups/create`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ name: groupName, participants: participantIds })
        });

        if (!res.ok) throw new Error('Failed to create group');
        return await res.json();
    } catch (err) {
        console.error('[createGroup]', err.message);
        return null;
    }
};