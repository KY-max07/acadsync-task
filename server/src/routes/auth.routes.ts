import express from 'express';
import { register, loginUser, registerWithSubscription } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/register-with-subscription', registerWithSubscription);
router.post('/login', loginUser);

export default router;
