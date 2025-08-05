import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/auth/status', {
                credentials: 'include',
            });
            console.log("response", response);
            if (response.ok) {
                const data = await response.json();
                
                console.log(" Response data:", data); 
                console.log(" User authenticated:", data.authenticated);
                console.log(" Username:", data.user);

                if(data.authenticated){
                    setIsAuthenticated(true);
                    setUser(data.user);
                }else{
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else if (response.status === 401) {
                // User is not authenticated, redirect to login
                setIsAuthenticated(false);
                setUser(null);
               //redirect to login page
               window.location.href = "/home";
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch("/auth/login", {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setUser({ username: data.username });
            return { success: true, data };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || "Login failed" };
        }
    };

    const logout = async () => {
        try {
            await fetch("/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            if (res.ok) {
                const data = await res.json();
                console.log(data.message); 
                navigate("/home"); 
            }
        }
    };

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuthStatus,
    };
}; 