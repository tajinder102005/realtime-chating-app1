import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../utils/socket";
import Sidebar from "../components/Sidebar";
import MessageArea from "../components/MessageArea";

const ChatPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        // Connect socket
        const s = connectSocket(token);
        setSocket(s);

        // Listen for online users
        s.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            disconnectSocket();
        };
    }, [token, navigate]);

    return (
        <div className="chat-layout">
            <Sidebar
                onSelectUser={setSelectedUser}
                selectedUserId={selectedUser?._id}
                onlineUsers={onlineUsers}
            />
            <MessageArea
                selectedUser={selectedUser}
                socket={socket}
                onlineUsers={onlineUsers}
            />
        </div>
    );
};

export default ChatPage;
