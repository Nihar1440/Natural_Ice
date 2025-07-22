import express from "express";
import { getNotifications, markAsRead, deleteNotification, markAllAsRead, deleteAllNotifications } from "../controllers/notification.controller.js";

const router = express.Router();

router.get('/:userId', getNotifications);
router.put('/read/:id', markAsRead);
router.delete('/delete/:id', deleteNotification);
router.put('/read-all/:userId', markAllAsRead);
router.delete('/delete-all/:userId', deleteAllNotifications);

export default router;
