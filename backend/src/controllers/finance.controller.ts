import type { Request, Response } from 'express';
import { prisma } from '../utils/db';
import type { AuthRequest } from '../middlewares/auth.middleware';

// ------------------------------------------------------------------
// Student Fee Collection
// ------------------------------------------------------------------
export const recordFeePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, academicMonthId, amount, paymentMethod, remarks } = req.body;

    if (!studentId || !academicMonthId || amount === undefined) {
      res.status(400).json({ success: false, message: 'studentId, academicMonthId, and amount are required.' });
      return;
    }

    // 1. Check if the fee collection record exists for this month/student
    let collection = await prisma.studentFeeCollection.findUnique({
      where: {
        studentId_academicMonthId: { studentId, academicMonthId }
      }
    });

    if (!collection) {
      // In a real app, you might auto-generate it or return an error. Let's return error if it doesn't exist.
      res.status(404).json({ success: false, message: 'Fee collection record not found for this month.' });
      return;
    }

    // 2. Add Payment Transaction
    const transaction = await prisma.feePaymentTransaction.create({
      data: {
        studentFeeCollectionId: collection.id,
        amountReceived: amount,
        paymentMethod: paymentMethod || 'CASH',
        paymentDate: new Date(),
        remarks,
        receivedBy: req.user!.userId
      }
    });

    // 3. Update the Collection Record
    const newTotal = Number(collection.totalReceivedAmount) + Number(amount);
    const newOutstanding = Number(collection.configuredFee) - Number(collection.discountAmount) - Number(collection.waivedAmount) - newTotal;
    
    let status: any = 'PARTIAL_PAID';
    if (newOutstanding <= 0) status = 'PAID';

    collection = await prisma.studentFeeCollection.update({
      where: { id: collection.id },
      data: {
        totalReceivedAmount: newTotal,
        outstandingAmount: newOutstanding > 0 ? newOutstanding : 0,
        paymentStatus: status,
        updatedBy: req.user!.userId
      }
    });

    res.status(200).json({ success: true, message: 'Fee payment recorded successfully.', data: { transaction, collection } });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getFeeCollections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicMonthId, studentId, paymentStatus } = req.query;

    const where: any = { isActive: true };
    if (academicMonthId) where.academicMonthId = academicMonthId as string;
    if (studentId) where.studentId = studentId as string;
    if (paymentStatus) where.paymentStatus = paymentStatus as any;

    const collections = await prisma.studentFeeCollection.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, itsNumber: true } }
      }
    });

    res.status(200).json({ success: true, data: collections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

// ------------------------------------------------------------------
// Monthly Settlement
// ------------------------------------------------------------------
export const generateMonthlySettlement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { academicMonthId } = req.body;

    if (!academicMonthId) {
      res.status(400).json({ success: false, message: 'academicMonthId is required.' });
      return;
    }

    // Ensure it doesn't already exist or isn't locked
    let settlement = await prisma.monthlySettlement.findUnique({
      where: { academicMonthId }
    });

    if (settlement && settlement.settlementStatus === 'LOCKED') {
      res.status(400).json({ success: false, message: 'Settlement is already locked for this month.', code: 'SETTLEMENT_LOCKED' });
      return;
    }

    // Logic: 
    // 1. Calculate total fee collected for the month
    const feeCollections = await prisma.studentFeeCollection.findMany({
      where: { academicMonthId, isActive: true }
    });
    
    const totalCollected = feeCollections.reduce((sum, coll) => sum + Number(coll.totalReceivedAmount), 0);

    // 2. Fetch working days or default to 30
    const workingDays = 30; // Could be fetched from academicMonth
    const dailyPool = totalCollected / workingDays;

    // Save settlement
    if (settlement) {
      settlement = await prisma.monthlySettlement.update({
        where: { id: settlement.id },
        data: {
          totalCollection: totalCollected,
          totalWorkingDays: workingDays,
          dailyPoolAmount: dailyPool,
          settlementStatus: 'GENERATED',
          updatedBy: req.user!.userId
        }
      });
    } else {
      settlement = await prisma.monthlySettlement.create({
        data: {
          academicMonthId,
          totalCollection: totalCollected,
          totalWorkingDays: workingDays,
          dailyPoolAmount: dailyPool,
          settlementStatus: 'GENERATED',
          generatedBy: req.user!.userId,
          createdBy: req.user!.userId
        }
      });
    }

    res.status(200).json({ success: true, message: 'Monthly settlement generated.', data: settlement });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const lockMonthlySettlement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const settlement = await prisma.monthlySettlement.findUnique({ where: { id } });
    if (!settlement) {
      res.status(404).json({ success: false, message: 'Settlement not found.' });
      return;
    }

    if (settlement.settlementStatus === 'LOCKED') {
      res.status(400).json({ success: false, message: 'Settlement is already locked.', code: 'SETTLEMENT_LOCKED' });
      return;
    }

    const locked = await prisma.monthlySettlement.update({
      where: { id },
      data: {
        settlementStatus: 'LOCKED',
        lockedAt: new Date(),
        lockedBy: req.user!.userId,
        updatedBy: req.user!.userId
      }
    });

    // We also need to lock the academic month
    await prisma.academicMonth.update({
      where: { id: locked.academicMonthId },
      data: { settlementStatus: 'LOCKED' }
    });

    res.status(200).json({ success: true, message: 'Monthly settlement locked successfully.', data: locked });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error.', code: 'INTERNAL_SERVER_ERROR' });
  }
};
