// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.jsx';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);
    const connected = useRef(false);

    useEffect(() => {
        if (!token || connected.current) return;

        const newSocket = io('https://localhost:5173', {
            auth: {
                token,
            },
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to socket.io');
            newSocket.emit('join', token);
            connected.current = true;
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from socket.io');
            connected.current = false;
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            connected.current = false;
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
