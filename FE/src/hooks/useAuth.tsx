import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const userEmail = localStorage.getItem('userEmail');

            if (!token || !userId || !userEmail) {
                setIsAuthenticated(false);
                setIsLoading(false);
                navigate('/signin');
                return;
            }

            try {
                // Verify token by making a request to a protected endpoint
                const response = await axios.get(`${BACKEND_URL}/api/v1/content/my`, {
                    headers: {
                        'Authorization': token
                    }
                });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                    setUser({
                        id: userId,
                        email: userEmail
                    });
                } else {
                    throw new Error('Invalid token');
                }
            } catch (error) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                setIsAuthenticated(false);
                navigate('/signin');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/signin');
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        logout
    };
}; 