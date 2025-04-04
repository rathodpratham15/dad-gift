import express from 'express';
import { register, login, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin); // 👈 Google Login Route

export default router;
