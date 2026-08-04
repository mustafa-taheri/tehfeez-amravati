import { Router } from 'express';
import { recordQuranSession, getQuranSessions } from '../controllers/quran-session.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Huffaz and Admin can manage Quran sessions
router.post('/', authorize(['ADMIN', 'HUFFAZ']), recordQuranSession);
router.get('/', authorize(['ADMIN', 'HUFFAZ']), getQuranSessions);

export default router;
