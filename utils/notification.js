import { Notification } from "../models/notification.model.js";



export async function orderPlacedNotification(userId, orderId) {
  await Notification.create({
    userId: userId,
    type: 'order',
    title: 'Order Placed',
    message: `Your order #${orderId} has been placed successfully.`
  });
}

export async function orderUpdatedNotification(userId, orderId, status) {
  await Notification.create({
    userId: userId,
    type: 'order',
    title: 'Order Updated',
    message: `Your order #${orderId} status has been updated to "${status}".`,
  });
}

