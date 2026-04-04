import { supabase } from "../config/supabase.js";
import jwt from "jsonwebtoken";

// 🔹 REGISTER
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                }
            }
        });

        if (authError) {
            return res.status(400).json({ message: authError.message });
        }

        // 3. Create user profile in custom users table
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    name: name,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (profileError) {
            // If profile creation fails, try to delete the auth user
            await supabase.auth.admin.deleteUser(authData.user.id);
            return res.status(400).json({ message: profileError.message });
        }

        // 4. Generate JWT for our app
        const token = jwt.sign(
            { id: authData.user.id, email: authData.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Response
        res.status(201).json({
            token,
            user: {
                id: authData.user.id,
                name: name,
                email: email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔹 LOGIN
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Sign in with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2. Get user profile from our users table
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            return res.status(400).json({ message: "User profile not found" });
        }

        // 3. Generate JWT for our app
        const token = jwt.sign(
            { id: authData.user.id, email: authData.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 4. Response
        res.json({
            token,
            user: {
                id: authData.user.id,
                name: profileData.name,
                email: authData.user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
