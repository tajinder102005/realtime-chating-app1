import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const MessageArea = ({ selectedUser, socket, onlineUsers }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { user, token } = useAuth();
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Use refs to avoid stale closures in socket handlers
    const selectedUserRef = useRef(selectedUser);
    const tokenRef = useRef(token);
    const conversationIdRef = useRef(null);
    const socketRef = useRef(socket);

    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);
    useEffect(() => { tokenRef.current = token; }, [token]);
    useEffect(() => { socketRef.current = socket; }, [socket]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherUserTyping]);

    // ─── Load message history when selected user changes ──────────────
    useEffect(() => {
        setMessages([]);
        setIsOtherUserTyping(false);
        setNewMessage("");
        conversationIdRef.current = null;

        if (!selectedUser || !token) return;

        let cancelled = false;

        const loadHistory = async () => {
            setLoadingHistory(true);
            try {
                // Step 1: Get (or create) the conversation between us
                const { data: convData } = await axios.get(
                    `${API}/messages/conversation/${selectedUser.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (cancelled) return;

                const convId = convData.conversationId;
                conversationIdRef.current = convId;

                // Step 2: Fetch all messages in that conversation
                const { data: msgs } = await axios.get(
                    `${API}/messages/${convId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (cancelled) return;

                setMessages(msgs);

                // Step 3: Mark messages as read via API + notify sender via socket
                axios.patch(
                    `${API}/messages/read/${convId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                ).then(() => {
                    if (socketRef.current && !cancelled) {
                        socketRef.current.emit("markRead", {
                            senderId: selectedUser.id,
                            conversationId: convId,
                        });
                    }
                }).catch(() => { });
            } catch (err) {
                console.error("Failed to load history:", err.message);
            } finally {
                if (!cancelled) setLoadingHistory(false);
            }
        };

        loadHistory();
        return () => { cancelled = true; };
    }, [selectedUser?._id, token]);

    // ─── Socket event listeners — attached ONCE per socket instance ───
    useEffect(() => {
        if (!socket) return;

        let receiverTypingTimeout;

        const handleReceive = ({ message, conversationId: incomingConvId }) => {
            const selUser = selectedUserRef.current;
            const senderId = message.sender?.id || message.sender;
            if (senderId !== selUser?.id) return;

            setMessages((prev) => [...prev, message]);
            setIsOtherUserTyping(false);

            // Mark as read + notify sender
            if (incomingConvId && tokenRef.current) {
                axios.patch(
                    `${API}/messages/read/${incomingConvId}`,
                    {},
                    { headers: { Authorization: `Bearer ${tokenRef.current}` } }
                ).then(() => {
                    if (socketRef.current) {
                        socketRef.current.emit("markRead", {
                            senderId: selUser._id,
                            conversationId: incomingConvId,
                        });
                    }
                }).catch(() => { });
            }
        };

        const handleSent = ({ message, conversationId: sentConvId }) => {
            setMessages((prev) => [...prev, message]);
            if (sentConvId && !conversationIdRef.current) {
                conversationIdRef.current = sentConvId;
            }
        };

        const handleUserTyping = ({ senderId }) => {
            if (senderId === selectedUserRef.current?._id) {
                setIsOtherUserTyping(true);
                if (receiverTypingTimeout) clearTimeout(receiverTypingTimeout);
                receiverTypingTimeout = setTimeout(() => setIsOtherUserTyping(false), 5000);
            }
        };

        const handleUserStoppedTyping = ({ senderId }) => {
            if (senderId === selectedUserRef.current?._id) {
                setIsOtherUserTyping(false);
                if (receiverTypingTimeout) clearTimeout(receiverTypingTimeout);
            }
        };

        const handleMessagesRead = ({ readerId }) => {
            if (readerId !== selectedUserRef.current?.id) return;
            setMessages((prev) =>
                prev.map((msg) => {
                    const senderId = msg.sender?._id || msg.sender;
                    if (senderId === user?.id && !(msg.readBy || []).includes(readerId)) {
                        return { ...msg, readBy: [...(msg.readBy || []), readerId] };
                    }
                    return msg;
                })
            );
        };

        socket.on("receiveMessage", handleReceive);
        socket.on("messageSent", handleSent);
        socket.on("userTyping", handleUserTyping);
        socket.on("userStoppedTyping", handleUserStoppedTyping);
        socket.on("messagesRead", handleMessagesRead);

        return () => {
            socket.off("receiveMessage", handleReceive);
            socket.off("messageSent", handleSent);
            socket.off("userTyping", handleUserTyping);
            socket.off("userStoppedTyping", handleUserStoppedTyping);
            socket.off("messagesRead", handleMessagesRead);
            if (receiverTypingTimeout) clearTimeout(receiverTypingTimeout);
        };
    }, [socket, user?.id]); // ← only re-register when socket itself changes

    // ─── Typing handler ────────────────────────────────────────────────
    const handleInput = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !selectedUser) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { receiverId: selectedUser.id });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("stopTyping", { receiverId: selectedUser.id });
        }, 2000);
    };

    // ─── Send message ──────────────────────────────────────────────────
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !socket) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false);
        socket.emit("stopTyping", { receiverId: selectedUser._id });
        socket.emit("sendMessage", {
            receiverId: selectedUser.id,
            content: newMessage.trim(),
        });
        setNewMessage("");
    };

    // ─── Helpers ───────────────────────────────────────────────────────
    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "Offline";
        const date = new Date(lastSeen);
        const diff = Math.floor((new Date() - date) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const ReadTick = ({ msg }) => {
        const senderId = msg.sender?.id || msg.sender;
        if (senderId !== user?.id) return null;
        const isSeen = msg.readBy && msg.readBy.length > 0;
        return (
            <span className={`read-tick ${isSeen ? "seen" : "sent"}`} title={isSeen ? "Seen" : "Sent"}>
                {isSeen ? "✓✓" : "✓"}
            </span>
        );
    };

    // ─── Empty state ───────────────────────────────────────────────────
    if (!selectedUser) {
        return (
            <div className="message-area empty-state">
                <div className="empty-content">
                    <span className="empty-icon">💬</span>
                    <h2>Welcome to ChatApp</h2>
                    <p>Select a user from the sidebar to start chatting</p>
                </div>
            </div>
        );
    }

    const isOnline = onlineUsers.includes(selectedUser.id);

    return (
        <div className="message-area">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-header-user">
                    <div className="chat-avatar">
                        {selectedUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
                    </div>
                    <div>
                        <h3>{selectedUser.name}</h3>
                        <span className={`header-status ${isOnline ? "online" : ""}`}>
                            {isOnline ? "Online" : `Last seen ${formatLastSeen(selectedUser.updated_at)}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {loadingHistory && (
                    <div className="history-loading">
                        <div className="skeleton-msg sent" />
                        <div className="skeleton-msg received" />
                        <div className="skeleton-msg sent" />
                    </div>
                )}

                {!loadingHistory && messages.length === 0 && (
                    <div className="no-messages">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const senderId = msg.sender?.id || msg.sender;
                    const isMine = senderId === user?.id;
                    return (
                        <div key={msg.id || index} className={`message ${isMine ? "sent" : "received"}`}>
                            <div className="message-bubble">
                                <p>{msg.content}</p>
                                <div className="message-meta">
                                    <span className="message-time">
                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    <ReadTick msg={msg} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isOtherUserTyping && (
                    <div className="message received typing-indicator-container">
                        <div className="typing-bubble">
                            <span className="typing-text">{selectedUser.name} is typing</span>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="message-input-form" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleInput}
                    autoFocus
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Send ➤
                </button>
            </form>
        </div>
    );
};

export default MessageArea;
