import { Router } from 'express';
import {
  register, login, me, signout, googleRedirect, googleCallback,
  completeGoogleAuth, finishGoogleSignup,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register',            register);
router.post('/login',               login);
router.get('/me',                   me);
router.post('/signout',             signout);
router.get('/google',               googleRedirect);
router.get('/google/callback',      googleCallback);
router.post('/google/complete',     completeGoogleAuth);
router.post('/google/finish-signup', finishGoogleSignup);

export default router;
