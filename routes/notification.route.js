import express from "express";
import { getNotifications, markAsRead, deleteNotification } from "../controllers/notification.controller.js";

const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/read/:id', markAsRead);
router.delete('/delete/:id', deleteNotification);

export default router;
