import { supabase } from "../config/supabase.js";

// Get current user profile
export const getUserProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search users by name or email (for finding people to chat with)
export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q || '';

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
            .neq('id', req.user.id);

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users (for sidebar — shows everyone you can chat with)
export const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .neq('id', req.user.id)
            .order('name', { ascending: true });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update logged-in user's profile (name)
export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name cannot be empty" });
        }

        const { data: user, error } = await supabase
            .from('users')
            .update({ name: name.trim() })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
