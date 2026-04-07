import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Get current session from Supabase only (no backend call on init)
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Use session user directly without backend call for faster loading
                    setUser(session.user);
                    setToken(session.access_token);
                    localStorage.setItem("token", session.access_token);
                    localStorage.setItem("user", JSON.stringify(session.user));

                    // Optional: Get user profile in background after UI loads
                    setTimeout(async () => {
                        try {
                            const response = await Promise.race([
                                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
                                    headers: { Authorization: `Bearer ${session.access_token}` }
                                }),
                                new Promise((_, reject) =>
                                    setTimeout(() => reject(new Error('Backend timeout')), 2000)
                                )
                            ]);
                            setUser(response.data.user);
                            localStorage.setItem("user", JSON.stringify(response.data.user));
                        } catch (error) {
                            console.log('Background profile update failed, keeping session user');
                        }
                    }, 1000);
                } else {
                    // Check localStorage for fallback
                    const savedToken = localStorage.getItem("token");
                    const savedUser = localStorage.getItem("user");
                    if (savedToken && savedUser) {
                        setToken(savedToken);
                        setUser(JSON.parse(savedUser));
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);

            if (session) {
                setUser(session.user);
                setToken(session.access_token);
                localStorage.setItem("token", session.access_token);
                localStorage.setItem("user", JSON.stringify(session.user));

                // Get user profile in background
                setTimeout(async () => {
                    try {
                        const response = await Promise.race([
                            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
                                headers: { Authorization: `Bearer ${session.access_token}` }
                            }),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Backend timeout')), 2000)
                            )
                        ]);
                        setUser(response.data.user);
                        localStorage.setItem("user", JSON.stringify(response.data.user));
                    } catch (error) {
                        console.log('Background profile update failed, keeping session user');
                    }
                }, 500);
            } else {
                logout();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Email/Password login
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // The onAuthStateChange listener will handle setting the user and token
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Email/Password registration
    const register = async (name, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name: name }
                }
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    };

    // OAuth login (Google, GitHub)
    const signInWithOAuth = async (provider) => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/chat`
                }
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('OAuth login error:', error);
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        signInWithOAuth,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
