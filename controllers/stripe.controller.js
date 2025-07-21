import Stripe from "stripe";
import dotenv from "dotenv";
import { Order } from "../models/order.model.js";
import { v4 as uuidv4 } from 'uuid';
import { orderPlacedNotification } from "../utils/notification.js";
import { Payment } from "../models/payment.model.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const {
    userId,
    guestId,
    email,
    items,
    shippingAddress,
    totalAmount,
    isGuest = false
  } = req.body;


  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // shipping_address_collection: {
      //   allowed_countries: ["US", "IN", "UAE"],
      // },

      customer_email: email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "AED",
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            description: "Optional description",
            images: [item.image],
            metadata: {
              category: item.category.name,
              productId: item.productId,
              originalPrice: item.originalPrice,
            },
          },
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId: userId || "",
        guestId: guestId || "",
        isGuest: isGuest.toString(),
        // Store the frontend-provided shipping address in metadata, now matching frontend's flat structure
        shipping_full_name: shippingAddress?.fullName || "", 
        shipping_phone_number: shippingAddress?.phoneNumber || "",
        shipping_address_line: shippingAddress?.addressLine || "",
        shipping_address_line2: shippingAddress?.addressLine2 || "",
        shipping_city: shippingAddress?.city || "",
        shipping_state: shippingAddress?.state || "",
        shipping_postal_code: shippingAddress?.postalCode || "",
        shipping_country: shippingAddress?.country || "",
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const storeOrderAfterPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {

    const existingOrder = await Order.findOne({ sessionId });
    if (existingOrder) {
      return res.status(200).json({
        message: "Order already exists",
        orderId: existingOrder.orderId,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "customer", "shipping"],
    });
    const lineItems = session.line_items;
    const collectedShippingAddress = session.shipping;
    const frontendProvidedShippingAddress = {
      fullName: session.metadata.shipping_full_name,
      phoneNumber: session.metadata.shipping_phone_number,
      addressLine: session.metadata.shipping_address_line,
      city: session.metadata.shipping_city,
      state: session.metadata.shipping_state,
      postalCode: session.metadata.shipping_postal_code,
      country: session.metadata.shipping_country,
    };
    const addressToStore = {
      fullName:
        collectedShippingAddress?.name ||
        frontendProvidedShippingAddress.fullName,
      phoneNumber: frontendProvidedShippingAddress.phoneNumber,
      addressLine:
        collectedShippingAddress?.address?.line1 ||
        frontendProvidedShippingAddress.addressLine,
      city:
        collectedShippingAddress?.address?.city ||
        frontendProvidedShippingAddress.city,
      state:
        collectedShippingAddress?.address?.state ||
        frontendProvidedShippingAddress.state,
      postalCode:
        collectedShippingAddress?.address?.postal_code ||
        frontendProvidedShippingAddress.postalCode,
      country:
        collectedShippingAddress?.address?.country ||
        frontendProvidedShippingAddress.country,
    };

    const order = new Order({
      orderId: uuidv4(), // <-- add this line
      sessionId: session.id,
      user: session.metadata.userId || null,
      guestId: session.metadata.guestId || null,
      isGuest: session.metadata.isGuest === "true",
      email: session.customer_details.email,
      totalAmount: session.amount_total / 100,
      items: lineItems.data.map((item) => ({
        name: item?.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
        productId: item.price.product.metadata.productId,
        category: item.price.product.metadata.category,
        originalPrice: item.price.product.metadata.originalPrice,
        image: item.price.product.images[0],
      })),
      shippingAddress: addressToStore,
    });

    await order.save();

    if (order.user) {
      await orderPlacedNotification(order.user, order._id);
    }

    res.status(201).json({
      message: "Order saved successfully",
      orderId: order.orderId,
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

 
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const existingOrder = await Order.findOne({ sessionId: session.id });
      if (existingOrder) {
        return res.status(200).send("Order already exists.");
      }

      // Expand line items and shipping 
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product", "customer", "shipping", "payment_intent.charges"],
      });

      const lineItems = expandedSession.line_items;
      const collectedShippingAddress = expandedSession.shipping;
      const meta = expandedSession.metadata;

      const frontendProvidedShippingAddress = {
        fullName: meta.shipping_full_name,
        phoneNumber: meta.shipping_phone_number,
        addressLine: meta.shipping_address_line,
        city: meta.shipping_city,
        state: meta.shipping_state,
        postalCode: meta.shipping_postal_code,
        country: meta.shipping_country,
      };

      const addressToStore = {
        fullName: collectedShippingAddress?.name || frontendProvidedShippingAddress.fullName,
        phoneNumber: frontendProvidedShippingAddress.phoneNumber,
        addressLine: collectedShippingAddress?.address?.line1 || frontendProvidedShippingAddress.addressLine,
        city: collectedShippingAddress?.address?.city || frontendProvidedShippingAddress.city,
        state: collectedShippingAddress?.address?.state || frontendProvidedShippingAddress.state,
        postalCode: collectedShippingAddress?.address?.postal_code || frontendProvidedShippingAddress.postalCode,
        country: collectedShippingAddress?.address?.country || frontendProvidedShippingAddress.country,
      };

      const order = new Order({
        orderId: uuidv4(),
        sessionId: session.id,
        user: meta.userId || null,
        guestId: meta.guestId || null,
        isGuest: meta.isGuest === "true",
        email: expandedSession.customer_details.email,
        totalAmount: expandedSession.amount_total / 100,
        items: lineItems.data.map((item) => ({
          name: item?.description,
          quantity: item.quantity,
          price: item.amount_total / 100,
          productId: item.price.product.metadata.productId,
          category: item.price.product.metadata.category,
          originalPrice: item.price.product.metadata.originalPrice,
          image: item.price.product.images[0],
        })),
        shippingAddress: addressToStore,
        status: "Processing",
      });

      await order.save();

      if (order.user) {
        await orderPlacedNotification(order.user, order._id);
      }
      const payment = new Payment({
        orderId: order._id,
        userId: order.user || null,
        guestId: order.guestId || null,
        email: order.email,
        amount: order.totalAmount,
        paymentStatus: "paid",
        paymentMethod: expandedSession.payment_method_types[0],
        gateway: "stripe",
        sessionId: order.sessionId,
        receiptUrl: expandedSession.payment_intent?.charges?.data[0]?.receipt_url || null,
        paymentTime: new Date(expandedSession.created * 1000),
      });
      
      await payment.save();

      return res.status(200).send("Order stored successfully");
    } catch (error) {
      console.error("Error creating order from webhook:", error);
      return res.status(500).send("Webhook processing failed");
    }
  }


  res.status(200).send("Event received");
};