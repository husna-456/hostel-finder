import express from "express";
import { sendPasswordLink, verifyResetLink, resetPassword } from "../controllers/passwordController.js"
const router = express.Router();

router.post("/setpasswordlink", sendPasswordLink);
router.get("/forget-password/:id/:token", verifyResetLink);
router.post("/reset/:id/:token", resetPassword);

export default router;