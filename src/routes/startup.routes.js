import { Router } from 'express';
import {
  createStartup, getMyStartups, updateStartup, deleteStartup,
  getAllStartups, getStartupById,
} from '../controllers/startup.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/',       getAllStartups);
router.get('/mine',   verifyToken, requireRole('founder'), getMyStartups);
router.get('/:id',    getStartupById);
router.post('/',      verifyToken, requireRole('founder'), createStartup);
router.put('/:id',    verifyToken, requireRole('founder'), updateStartup);
router.delete('/:id', verifyToken, requireRole('founder'), deleteStartup);

export default router;
