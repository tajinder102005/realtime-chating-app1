import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Create message
        const message = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            content,
        });

        // Update lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate("sender", "name email")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all messages in a conversation as read
export const markRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            {
                conversationId,
                sender: { $ne: userId },      // not sent by me
                readBy: { $ne: userId },       // not already read by me
            },
            { $addToSet: { readBy: userId } }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get conversation ID between two users (or create one)
export const getOrCreateConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user._id;

        let conversation = await Conversation.findOne({
            isGroup: false,
            participants: { $all: [myId, userId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [myId, userId],
            });
        }

        res.json({ conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations for logged-in user
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate("participants", "name email")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};