import Stripe from "stripe";
import dotenv from "dotenv";
import { Order } from "../models/order.model.js";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { items, shippingAddress } = req.body;

  // --- ADD THIS LOG ---
  console.log(
    "Received shippingAddress in createCheckoutSession:",
    shippingAddress
  );
  // --------------------

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // shipping_address_collection: {
      //   allowed_countries: ["US", "IN", "UAE"],
      // },

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
  const { sessionId, userId } = req.body;

  try {
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
      user: userId,
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

    res.status(201).json({
      message: "Order saved successfully",
      orderId: order._id,
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
