import express from "express";
import { registerDeliveryAgent, getAllDeliveryAgents, setDeliveryAgentInactive, setDeliveryAgentActive, assignDeliveryAgent, getAssignedOrders, addDeliveryNotes } from "../controllers/delivery.controller.js";
import { isAdmin, isDeliveryAgent } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post('/register',isAdmin, registerDeliveryAgent);
router.get('/all', isAdmin, getAllDeliveryAgents);
router.put('/inactive/:id', isAdmin, setDeliveryAgentInactive);
router.put('/active/:id', isAdmin, setDeliveryAgentActive);
router.post('/assign', isAdmin, assignDeliveryAgent);


router.get('/assigned-orders/:deliveryAgentId', getAssignedOrders);
router.put('/add-notes/:orderId', isDeliveryAgent, addDeliveryNotes);

export default router;