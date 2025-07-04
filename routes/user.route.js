import express from "express"
import {register,loginUser, updateUser, getuser,logoutUser, forgotPassword, resetPassword, refreshToken} from "../controllers/user.controller.js"
import { protect,isAdmin } from "../middlewares/authmiddleware.js"

const router = express.Router()

router.post('/create',register)
router.post('/login',loginUser)
router.put('/update/:id',updateUser)

router.get("/profile",getuser)
router.get("/admin-data", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.post("/refresh-token",refreshToken);

router.post("/logout",logoutUser)

router.post("/forgot-password",forgotPassword)
router.post("/reset-password/:token",resetPassword)

export default router