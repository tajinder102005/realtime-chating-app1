import { supabase } from "../config/supabase.js";

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        // Find or create conversation
        const { data: existingConversations, error: findError } = await supabase
            .from('conversations')
            .select('*')
            .contains('participants', [senderId, receiverId]);

        if (findError) {
            return res.status(500).json({ message: findError.message });
        }

        let conversation;
        if (existingConversations && existingConversations.length > 0) {
            conversation = existingConversations[0];
        } else {
            // Create new conversation
            const { data: newConversation, error: createError } = await supabase
                .from('conversations')
                .insert([{
                    participants: [senderId, receiverId],
                    is_group: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) {
                return res.status(500).json({ message: createError.message });
            }
            conversation = newConversation;
        }

        // Create message
        const { data: message, error: messageError } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversation.id,
                sender_id: senderId,
                content: content,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (messageError) {
            return res.status(500).json({ message: messageError.message });
        }

        // Update lastMessage in conversation
        const { error: updateError } = await supabase
            .from('conversations')
            .update({
                last_message: message.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', conversation.id);

        if (updateError) {
            return res.status(500).json({ message: updateError.message });
        }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users(id, name, email)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all messages in a conversation as read
export const markRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const { error } = await supabase
            .from('messages')
            .update({
                read_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .is('read_at', null);

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get conversation ID between two users (or create one)
export const getOrCreateConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.id;

        const { data: existingConversations, error: findError } = await supabase
            .from('conversations')
            .select('*')
            .eq('is_group', false)
            .contains('participants', [myId, userId]);

        if (findError) {
            return res.status(500).json({ message: findError.message });
        }

        let conversation;
        if (existingConversations && existingConversations.length > 0) {
            conversation = existingConversations[0];
        } else {
            // Create new conversation
            const { data: newConversation, error: createError } = await supabase
                .from('conversations')
                .insert([{
                    participants: [myId, userId],
                    is_group: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) {
                return res.status(500).json({ message: createError.message });
            }
            conversation = newConversation;
        }

        res.json({ conversationId: conversation.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations for logged-in user
export const getConversations = async (req, res) => {
    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                participants:users(id, name, email),
                last_message:messages(id, content, created_at, sender_id)
            `)
            .contains('participants', [req.user.id])
            .order('updated_at', { ascending: false });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};