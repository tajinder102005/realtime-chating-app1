import express from "express";
import { sendMessage, getMessages, getConversations, markRead, getOrCreateConversation } from "../controllers/messageController.js";
import protect from "../middleware/authMiddlerware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/conversation/:userId", protect, getOrCreateConversation);
router.patch("/read/:conversationId", protect, markRead);
router.get("/:conversationId", protect, getMessages);

export default router;
