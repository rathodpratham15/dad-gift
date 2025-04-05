// service/service/routers/resetPasswordRoutes.js
import express from "express";
import {
    requestPasswordReset,
    resetPassword,
} from "../controllers/resetPasswordController.js";

const router = express.Router();

router.post("/reset-request", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
