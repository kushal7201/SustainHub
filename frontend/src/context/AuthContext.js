import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set up axios interceptor
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/users/profile`);
                    setUser(response.data);
                } catch (error) {
                    console.error('Error loading user:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_CONFIG.REACT_APP_API_BASE_URL}/auth/login`, {
                email,
                password
            });

            const { token: newToken, user: userData } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_CONFIG.REACT_APP_API_BASE_URL}/auth/register`, userData);
            
            const { token: newToken, user: newUser } = response.data;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const response = await axios.get(`${API_CONFIG.REACT_APP_API_BASE_URL}/users/profile`);
                setUser(response.data);
                return response.data;
            } catch (error) {
                console.error('Error refreshing user:', error);
                return null;
            }
        }
        return null;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
