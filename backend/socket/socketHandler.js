import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// 🔥 Map: userId → socketId (tracks who's connected)
const onlineUsers = new Map();

export const getOnlineUsers = () => onlineUsers;

export const setupSocket = (io) => {
    // 🔐 Middleware: Authenticate socket connections via JWT
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error: No token"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user; // Attach user to socket
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    // 🔥 Handle connections
    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();
        console.log(`✅ User connected: ${socket.user.name} (${userId})`);

        // Add to online users map
        onlineUsers.set(userId, socket.id);

        // Broadcast online status to everyone
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

        // ──────────────────────────────────────────────
        // 📩 SEND MESSAGE (same as Phase 1)
        // ──────────────────────────────────────────────
        socket.on("sendMessage", async ({ receiverId, content }) => {
            try {
                let conversation = await Conversation.findOne({
                    isGroup: false,
                    participants: { $all: [userId, receiverId] },
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [userId, receiverId],
                    });
                }

                const message = await Message.create({
                    conversationId: conversation._id,
                    sender: userId,
                    content,
                });

                conversation.lastMessage = message._id;
                await conversation.save();

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "name email");

                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", {
                        message: populatedMessage,
                        conversationId: conversation._id,
                    });
                }

                socket.emit("messageSent", {
                    message: populatedMessage,
                    conversationId: conversation._id,
                });
            } catch (error) {
                console.error("Error sending message:", error.message);
                socket.emit("messageError", { error: error.message });
            }
        });

        // ──────────────────────────────────────────────
        // ⌨️ TYPING INDICATORS (Phase 2 - NEW!)
        // ──────────────────────────────────────────────
        //
        // HOW IT WORKS:
        // 1. When Alice starts typing, her frontend emits "typing" 
        //    with Bob's userId as receiverId
        // 2. The server receives it and forwards it to Bob's socket
        // 3. Bob's frontend shows "Alice is typing..."
        // 4. When Alice stops typing (after 2 sec timeout), 
        //    her frontend emits "stopTyping"
        // 5. The server forwards it to Bob → typing indicator disappears
        //
        // ⚠️ These events are NOT saved to the database — they're 
        //    "ephemeral" (temporary). No point storing "typing" in DB!
        //
        socket.on("typing", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                // Forward to the receiver: "this user is typing to you"
                io.to(receiverSocketId).emit("userTyping", {
                    senderId: userId,
                    senderName: socket.user.name,
                });
            }
        });

        socket.on("stopTyping", ({ receiverId }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", {
                    senderId: userId,
                });
            }
        });

        // ──────────────────────────────────────────────
        // 👁️ READ RECEIPTS (Phase 4 - NEW!)
        // ──────────────────────────────────────────────
        //
        // HOW IT WORKS:
        // 1. When Bob opens a conversation with Alice, his frontend emits
        //    "markRead" with Alice's userId (the other person's id)
        // 2. The server finds Alice's socket and emits "messagesRead" to her
        // 3. Alice's frontend updates the tick on her sent messages to ✓✓
        //
        socket.on("markRead", ({ senderId, conversationId }) => {
            const senderSocketId = onlineUsers.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", {
                    readerId: userId,
                    conversationId,
                });
            }
        });

        // ──────────────────────────────────────────────
        // 🔌 DISCONNECT (Phase 2 - Updated!)
        // ──────────────────────────────────────────────
        //
        // HOW "LAST SEEN" WORKS:
        // When a user disconnects, we save the current timestamp 
        // to their `lastSeen` field in MongoDB. Next time someone 
        // opens the sidebar, they'll see "Last seen 5 mins ago" 
        // instead of just "Offline".
        //
        socket.on("disconnect", async () => {
            console.log(`❌ User disconnected: ${socket.user.name}`);
            onlineUsers.delete(userId);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));

            // 🆕 Save lastSeen timestamp to database
            try {
                await User.findByIdAndUpdate(userId, {
                    lastSeen: new Date(),
                });
            } catch (error) {
                console.error("Error updating lastSeen:", error.message);
            }
        });
    });
};
