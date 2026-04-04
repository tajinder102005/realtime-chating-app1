import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../config/supabase";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage and check Supabase session on app start
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check for existing Supabase session
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Get user profile from our backend
                    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`
                        }
                    });

                    setUser(response.data.user);
                    setToken(session.access_token);
                } else {
                    // Fallback to localStorage for backward compatibility
                    const savedToken = localStorage.getItem("token");
                    const savedUser = localStorage.getItem("user");

                    if (savedToken && savedUser) {
                        setToken(savedToken);
                        setUser(JSON.parse(savedUser));
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    try {
                        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
                            headers: {
                                Authorization: `Bearer ${session.access_token}`
                            }
                        });

                        setUser(response.data.user);
                        setToken(session.access_token);
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                        logout();
                    }
                } else {
                    logout();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("token", tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out from Supabase:", error);
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    // Update user data in state + localStorage (e.g. after profile change)
    const updateUser = (newUserData) => {
        const merged = { ...user, ...newUserData };
        setUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
