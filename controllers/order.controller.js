import moment from "moment";
import { Order } from "../models/order.model.js";
import { orderUpdatedNotification } from "../utils/notification.js";

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
      paymentStatus: "Pending",
      status: "Pending",
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
    const order = await Order.findById(id).populate('user', 'name email phoneNumber').populate('deliveryAgent', '_id name email phoneNumber');
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
    const orders = await Order.find({ user: userId }).populate('deliveryAgent', 'name email phoneNumber');

    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: 'No orders found for this user', orders: [] });
    }

    res.status(200).json({ orders }); // createdAt, shippedAt, deliveredAt will be included
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


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location = "Warehouse" } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === order.status) {
      return res.status(400).json({ message: 'Order already in this status' });
    }

    const now = new Date();
    if (status === "Shipped" && !order.shippedAt) {
      order.shippedAt = now;
      const estimatedDate = new Date(now);
      estimatedDate.setDate(estimatedDate.getDate() + 5);
      order.estimatedDeliveryDate = estimatedDate;
    }

    if (status === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = now;
    }

    // Update tracking history
    order.trackingHistory.push({
      status,
      location,
      timestamp: now,
    });

    order.status = status;
    await order.save();

    // Optional: Notify registered user
    if (order.user) {
      await orderUpdatedNotification(order.user, order._id, status);
    }

    res.status(200).json({ message: 'Order status updated successfully', order });

  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


export const cancelOrder = async (req, res) => {
  const id = req.params.orderId;

  try {
    const order = await Order.findById(id);

    if(!order){
      return res.status(404).json({ message: "Order not found"})
    }

    if(order.status === "Cancelled"){
      return res.status(201).json({ message: "Order already Cancelled"})
    }

    if(order.status === "Shipped" || order.status === "Delivered" || order.status === "Returned"){
      return res.status(400).json({ message: `Order cannot be Cancelled after it has been ${order.status}.` });
    }

    order.status = "Cancelled";
    order.createdAt = new Date();
    await order.save();


    if (order.user) {
      await orderUpdatedNotification(order.user, order._id, "Cancelled");
    }

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error in Cancelling Order."});
  }
  
}

export const getCancelledOrders = async (req, res) => {
  try {
    const cancelledOrders = await Order.find({ 
      status: "Cancelled", 
      refundStatus: "Pending" 
    }).populate('user', 'name email phoneNumber');

    if (!cancelledOrders || cancelledOrders.length === 0) {
      return res.status(200).json({ message: 'No cancelled orders found', cancelledOrders: [] });
    }

    res.status(200).json({ cancelledOrders }); // createdAt, shippedAt, deliveredAt will be included
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


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

// ✅ Get recent orders for Admin Dashboard
export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email") // optional: include user info
      .select("orderId status totalAmount createdAt");

    res.status(200).json({ success: true, orders: recentOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getTotalRevenue = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ status: 'Delivered' });

    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    res.status(200).json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue', error });
  }
};


export const getSalesOverview = async (req, res) => {
  try {
    const salesData = [];

    for (let i = 5; i >= 0; i--) {
      const start = moment().subtract(i, 'months').startOf('month').toDate();
      const end = moment().subtract(i, 'months').endOf('month').toDate();
      const label = moment(start).format('MMM YYYY');

      const orders = await Order.find({
        status: 'Delivered',
        createdAt: { $gte: start, $lte: end },
      });

      const totalSales = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

      salesData.push({ label, totalSales });
    }

    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales overview', error });
  }
};
