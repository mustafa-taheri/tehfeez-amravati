import { Router } from 'express';
import { 
  recordFeePayment, 
  getFeeCollections, 
  generateMonthlySettlement, 
  lockMonthlySettlement 
} from '../controllers/finance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Student Fee Collections
router.post('/fee-payment', authorize(['ADMIN']), recordFeePayment);
router.get('/fee-collections', authorize(['ADMIN']), getFeeCollections);

// Monthly Settlements
router.post('/settlements/generate', authorize(['ADMIN']), generateMonthlySettlement);
router.post('/settlements/:id/lock', authorize(['ADMIN']), lockMonthlySettlement);

export default router;
