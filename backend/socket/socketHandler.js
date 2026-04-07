import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

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
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
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
        const userId = socket.user.id;
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
                // Get or create conversation
                let { data: conversation, error: convError } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('is_group', false)
                    .contains('participants', [userId, receiverId])
                    .single();

                if (convError && convError.code === 'PGRST116') {
                    // Conversation doesn't exist, create it
                    const { data: newConv, error: createError } = await supabase
                        .from('conversations')
                        .insert([{
                            participants: [userId, receiverId],
                            is_group: false,
                            created_at: new Date().toISOString()
                        }])
                        .select()
                        .single();

                    if (createError) throw createError;
                    conversation = newConv;
                } else if (convError) {
                    throw convError;
                }

                // Create message
                const { data: message, error: msgError } = await supabase
                    .from('messages')
                    .insert([{
                        conversation_id: conversation.id,
                        sender_id: userId,
                        content: content,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (msgError) throw msgError;

                // Update conversation's last message
                await supabase
                    .from('conversations')
                    .update({
                        last_message: content,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', conversation.id);

                // Get sender info
                const { data: senderData } = await supabase
                    .from('users')
                    .select('name, email')
                    .eq('id', userId)
                    .single();

                const populatedMessage = {
                    ...message,
                    sender: senderData
                };

                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", {
                        message: populatedMessage,
                        conversationId: conversation.id,
                    });
                }

                socket.emit("messageSent", {
                    message: populatedMessage,
                    conversationId: conversation.id,
                });
            } catch (error) {
                console.error("Error sending message:", error.message);
                socket.emit("messageError", { error: error.message });
            }
        });

        // ──────────────────────────────────────────────
        // ⌨️ TYPING INDICATORS (Phase 2 - NEW!)
        // ──────────────────────────────────────────────
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
        socket.on("disconnect", async () => {
            console.log(`❌ User disconnected: ${socket.user.name}`);
            onlineUsers.delete(userId);
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));

            // 🆕 Save lastSeen timestamp to database
            try {
                await supabase
                    .from('users')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', userId);
            } catch (error) {
                console.error("Error updating lastSeen:", error.message);
            }
        });
    });
};
