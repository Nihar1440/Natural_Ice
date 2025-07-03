import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Order } from '../models/order.model.js';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // from .env


export const createCheckoutSession = async (req, res) => {
  const { items } = req.body; // [{ name, price, quantity }]

  try {
    const session = await stripe.checkout.sessions.create({
      // Add more payment methods as needed
      mode: 'payment',

      line_items: items.map((item) => ({
        price_data: {
          currency: 'inr',
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            description: 'Optional description',
            images: [item.image], // ✅ must be a public URL
            metadata: {
              category: item.category.name,
              productId: item.productId,
              originalPrice: item.originalPrice
            }
          }
        },
        quantity: item.quantity
      })),

      success_url: `https://ecommerce-frontend-three-ruby.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      // Cancel page
      cancel_url: 'https://ecommerce-frontend-three-ruby.vercel.app/cancel'
    });

    res.json({ url: session.url }); // Send session URL to frontend
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const storeOrderAfterPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer']
    });

    const lineItems = session.line_items; // Use session.line_items directly

    const order = new Order({
      sessionId: session.id,
      email: session.customer_details.email,
      totalAmount: session.amount_total / 100,
      items: lineItems.data.map(item => ({
        name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
        productId: item.price.product.metadata.productId,
        category: item.price.product.metadata.category,
        originalPrice: item.price.product.metadata.originalPrice,
        image: item.price.product.images[0]
      }))
    });

    await order.save();

    res.status(201).json({ message: 'Order saved successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

