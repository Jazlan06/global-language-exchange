import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
});

export const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (formData) => {
    const response = await API.post('auth/register', formData);
    return response.data;
}