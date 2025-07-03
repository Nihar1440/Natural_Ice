import { Order } from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const { sessionId, email, items, totalAmount } = req.body;

    const newOrder = await Order.create({
      sessionId,
      email,
      items,
      totalAmount,
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrder =async(req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderPlacedTime = new Date(order.createdAt);
    const currentTime = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (currentTime.getTime() - orderPlacedTime.getTime() <= twentyFourHours) {
      
      res.status(200).json({ message: 'Return request placed successfully. Refund process initiated.' });
    } else {
      res.status(400).json({ message: 'Unable to place return request. The 24-hour return window has passed.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};