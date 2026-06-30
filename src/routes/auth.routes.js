import { Router } from 'express';
import { register, login, me, signout } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        me);
router.post('/signout',  signout);

export default router;
