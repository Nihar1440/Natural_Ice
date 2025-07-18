import { Order } from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      guestId,
      email,
      items,
      shippingAddress,
      totalAmount,
      isGuest = false,
    } = req.body;


    if (!email || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const order = await Order.create({
      userId,
      guestId: isGuest ? guestId : null,
      isGuest,
      email,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: "pending",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Something went wrong" });
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

export const getOrder = async (req, res) => {
  try {
    const { name, status, date } = req.query;
    const filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by date (createdAt)
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    // Always use find + populate
    let orders = await Order.find(filter).populate('user', 'name email phoneNumber');

    // If name filter is provided, filter in-memory after population
    if (name) {
      const nameLower = name.toLowerCase();
      orders = orders.filter(order =>
        order.user && order.user.name && order.user.name.toLowerCase().includes(nameLower)
      );
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId });
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('socketio');
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    io.to(id).emit('orderStatusUpdate', updatedOrder)
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
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (currentTime.getTime() - orderPlacedTime.getTime() <= twentyFourHours) {
      
      res.status(200).json({ message: 'Return request placed successfully. Refund process initiated.' });
    } else {
      res.status(400).json({ message: 'Unable to place return request. The 24-hour return window has passed.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return only tracking-related fields
    res.status(200).json({
      status: order.status,
      currentLocation: order.currentLocation,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      trackingHistory: order.trackingHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};