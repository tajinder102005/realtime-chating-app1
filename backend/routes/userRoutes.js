import express from "express";
import { searchUsers, getAllUsers, updateProfile, getUserProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddlerware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.get("/search", protect, searchUsers);
router.get("/all", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

export default router;
