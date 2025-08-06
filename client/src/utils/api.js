export const getChats = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/chats', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load chats');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};

export const getMessages = async (chatId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/chats/${chatId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load messages');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};

export const sendMessage = async ({ chatId, text }) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/chats/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ chatId, text }),
        });
        if (!res.ok) throw new Error('Failed to send message');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};


export const createOrGetChat = async (userId) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/chats/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientId: userId }), 
        });
        if (!res.ok) throw new Error('Failed to create or get chat');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};

