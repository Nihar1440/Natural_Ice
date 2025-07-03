import express from "express"
import productRoutes from "./routes/product.route.js"
import categoryRoutes from "./routes/category.route.js"
import productlistRoutes from "./routes/productlist.route.js"
import cartRoutes from "./routes/cart.route.js"
import userRoutes from "./routes/user.route.js"
import emailRoutes from "./routes/email.route.js"
import chatRoutes from "./routes/chat.route.js"
import paymentRoutes from "./routes/payment.route.js"
import receiptRoutes from "./routes/receipt.route.js"
import orderRoutes from "./routes/order.route.js"

import wishListRoutes from "./routes/wishList.route.js"

import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.json()); // for parsing application/json
// Route prefix
app.use('/api/product', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/user',userRoutes)
app.use('/api/productlist',productlistRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/contact', emailRoutes);
app.use('/api',chatRoutes)
app.use('/api/wishlist',wishListRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/receipt',receiptRoutes)
app.use('/api/order',orderRoutes)

export {app}