import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ProfileModal = ({ onClose }) => {
    const { user, token, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`,
                { name: name.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state + localStorage
            updateUser({ name: data.name });
            setSuccess("Profile updated successfully!");

            // Close modal after short delay
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>👤 Your Profile</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-avatar">
                    {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                </div>

                <form onSubmit={handleSave} className="modal-form">
                    <label>Display Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        maxLength={40}
                    />

                    <label>Email</label>
                    <input
                        type="text"
                        value={user?.email || ""}
                        readOnly
                        className="readonly-input"
                    />

                    {error && <p className="modal-error">{error}</p>}
                    {success && <p className="modal-success">{success}</p>}

                    <button type="submit" disabled={saving} className="modal-save-btn">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
