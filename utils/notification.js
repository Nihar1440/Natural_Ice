import { Notification } from "../models/notification.model.js";
import { Order } from "../models/order.model.js";


export async function orderPlacedNotification(userId, orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      console.error("Order not found");
    }
  
    // Get item names and join them
    const itemNames = order.items.map(item => item.name).join(", ");

  await Notification.create({
    userId: userId,
    type: 'Order',
    title: 'Order Placed',
    message: `Hey! We got your order for ${itemNames}.\nYour Order ID is #${order.orderId}.`
  });
}

export async function orderUpdatedNotification(userId, orderId, status) {
    const order = await Order.findById(orderId);

    if (!order) {
      console.error("Order not found");
    }
  
    // Get item names and join them
    const itemNames = order.items.map(item => item.name).join(", ");

  await Notification.create({
    userId: userId,
    type: 'Order',
    title: 'Order Updated',
    message: `Your order for ${itemNames} has been "${status}" successfully. Track you order with orderId: ${order.orderId}.`,
  });
}

