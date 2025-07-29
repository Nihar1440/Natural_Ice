import { Order } from "../models/order.model.js";
import { ReturnOrder } from "../models/returnOrder.model.js";

export const returnOrderRequest = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason, comment, products } = req.body;

        if (!reason || !comment || !products || products.length === 0) {
            return res.status(400).json({ message: 'Reason, comment, and products are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const orderDeliveredTime = new Date(order.deliveredAt);
        const currentTime = new Date();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (currentTime.getTime() - orderDeliveredTime.getTime() > twentyFourHours) {
            return res.status(400).json({ message: 'Return window (24 hrs) has passed.' });
        }

        const returnItems = [];

        for (const product of products) {
            const item = order.items.find(i => i.productId.toString() === product.productId);

            if (!item) continue;

            const alreadyReturned = item.returnedQuantity || 0;
            const maxReturnable = item.quantity - alreadyReturned;

            if (product.quantity > maxReturnable) {
                return res.status(400).json({
                    message: `Cannot return more than remaining quantity for ${item.name}. Already returned: ${alreadyReturned}`
                });
            }

            if (product.quantity <= 0 || maxReturnable <= 0) {
                continue;
            }

            returnItems.push({
                productId: item.productId,
                name: item.name,
                quantity: product.quantity,
                price: item.price,
                image: item.image,
                originalPrice: item.originalPrice,
                category: item.category
            });

            // Update returnedQuantity in the order item
            item.returnedQuantity = alreadyReturned + product.quantity;
        }

        if (returnItems.length === 0) {
            return res.status(400).json({ message: 'All selected products have already been fully returned.' });
        }

        const refundAmount = returnItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const returnOrder = new ReturnOrder({
            user: order.user,
            orderId: order._id,
            reason,
            comment,
            items: returnItems,
            refundAmount,
            pickUpAddress: order.shippingAddress,
            status: 'Requested',
            refundStatus: 'Pending',
            requestedAt: new Date()
        });

        if (req.file) {
            returnOrder.imageUrl = req.file.path;
        }

        await returnOrder.save();
        await order.save(); 

        res.status(200).json({
            message: 'Return request placed successfully.',
            returnOrder
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const cancelReturnRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const returnOrder = await ReturnOrder.findById(id);
        if (!returnOrder) {
            return res.status(404).json({ message: 'return order not found' });
        }


        if (returnOrder.status === 'Picked' || returnOrder.status === 'Refunded') {
            return res.status(400).json({ message: 'Return request cannot be cancelled after it has been picked or refunded.' });
        }

        if (returnOrder.status === 'Cancelled') {
            return res.status(400).json({ message: 'Return request is already cancelled.' });
        }

        returnOrder.status = 'Cancelled';
        returnOrder.cancelledAt = new Date();
        await returnOrder.save();

        res.status(200).json({ message: 'Return request cancelled successfully', returnOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllReturnRequestOrders = async (req, res) => {
    const { status } = req.query;

    let filter = {};

    if (status) {
        filter["status"] = new RegExp(`^${status}$`, 'i');
    }

    try {
        const returnRequest = await ReturnOrder.find(filter)
            .populate('pickUpAgent', '_id name email phoneNumber');

        if (!returnRequest || returnRequest.length === 0) {
            return res.status(200).json({ message: 'No return requests found', returnRequest: [] });
        }

        res.status(200).json({ returnRequest });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const updateReturnRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const returnOrder = await ReturnOrder.findById(id);
        
        if (!returnOrder) {
            return res.status(404).json({ message: 'return order not found' });
        }

        const order = await Order.findById(returnOrder.orderId);
        if (!order) {
            return res.status(404).json({ message: 'order not found' });
        }

        if (returnOrder.status !== 'Requested') {
            return res.status(400).json({ message: 'No return request found for this order.' });
        }

        if (status === 'Approved') {
            returnOrder.status = 'Approved';
            returnOrder.approvedAt = new Date();
        } else if (status === 'Rejected') {
            returnOrder.status = 'Rejected';
            returnOrder.rejectedAt = new Date();
        } else if (status === 'Picked') {
            returnOrder.status = 'Picked';
            returnOrder.pickedAt = new Date();
            order.status = 'Returned';
        } else if (status === 'Refunded') {
            returnOrder.status = 'Refunded';
            returnOrder.refundedAt = new Date();
            order.status = 'Returned';
        } else if (status === 'Cancelled') {
            returnOrder.status = 'Cancelled';
            returnOrder.cancelledAt = new Date();
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await returnOrder.save();
        res.status(200).json({ message: 'Return request status updated successfully', returnOrder });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}