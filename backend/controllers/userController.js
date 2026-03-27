import User from "../models/User.js";

// Search users by name or email (for finding people to chat with)
export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q
            ? {
                $or: [
                    { name: { $regex: req.query.q, $options: "i" } },
                    { email: { $regex: req.query.q, $options: "i" } },
                ],
            }
            : {};

        // Exclude the logged-in user from results
        const users = await User.find({
            ...keyword,
            _id: { $ne: req.user._id },
        }).select("-password");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users (for sidebar — shows everyone you can chat with)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("-password")
            .sort({ name: 1 });

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

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim() },
            { new: true }
        ).select("-password");

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
