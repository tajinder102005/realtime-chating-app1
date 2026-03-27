import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

const Sidebar = ({ onSelectUser, selectedUserId, onlineUsers }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [showProfile, setShowProfile] = useState(false);
    const { token, logout, user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/users/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "Offline";
        const date = new Date(lastSeen);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000);

        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>💬 Chats</h2>
                    <div className="header-actions">
                        <button
                            className="profile-btn"
                            onClick={() => setShowProfile(true)}
                            title="Edit profile"
                        >
                            👤
                        </button>
                        <button className="logout-btn" onClick={logout} title="Logout">
                            ↪
                        </button>
                    </div>
                </div>

                <div className="sidebar-user-info">
                    <span>Logged in as <strong>{currentUser?.name}</strong></span>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="user-list">
                    {filteredUsers.map((u) => (
                        <div
                            key={u._id}
                            className={`user-item ${selectedUserId === u._id ? "active" : ""}`}
                            onClick={() => onSelectUser(u)}
                        >
                            <div className="user-avatar">
                                {getInitials(u.name)}
                                <span
                                    className={`status-dot ${onlineUsers.includes(u._id) ? "online" : "offline"
                                        }`}
                                />
                            </div>
                            <div className="user-info">
                                <span className="user-name">{u.name}</span>
                                <span className="user-status-text">
                                    {onlineUsers.includes(u._id)
                                        ? "Online"
                                        : formatLastSeen(u.lastSeen)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <p className="no-users">No users found</p>
                    )}
                </div>
            </div>

            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        </>
    );
};

export default Sidebar;

