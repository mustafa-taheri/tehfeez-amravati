-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HUFFAZ');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'HALF_DAY', 'LEAVE', 'ABSENT', 'UZUR');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'COMPLETED', 'SHIFTED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL_PAID', 'UNPAID', 'WAIVED', 'DISCOUNTED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('HIFZ', 'MURAJAAH', 'MIXED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'GENERATED', 'LOCKED');

-- CreateEnum
CREATE TYPE "MarhalaCode" AS ENUM ('ULA', 'SANIYAH', 'SALESAH', 'RABEAH', 'KHAMESAH', 'SADESAH');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "fullName" VARCHAR(200) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150),
    "mobileNumber" VARCHAR(20) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'HUFFAZ',
    "profileImage" TEXT,
    "lastLoginAt" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicPeriod" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,

    CONSTRAINT "AcademicPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicMonth" (
    "id" UUID NOT NULL,
    "academicPeriodId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "monthNumber" SMALLINT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "workingDays" SMALLINT NOT NULL,
    "settlementStatus" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,

    CONSTRAINT "AcademicMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marhala" (
    "id" UUID NOT NULL,
    "code" "MarhalaCode" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "displayOrder" SMALLINT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marhala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarhalaFeeConfiguration" (
    "id" UUID NOT NULL,
    "academicPeriodId" UUID NOT NULL,
    "marhalaId" UUID NOT NULL,
    "monthlyFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,

    CONSTRAINT "MarhalaFeeConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "itsNumber" SMALLINT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "fullName" VARCHAR(200) NOT NULL,
    "fatherName" VARCHAR(200),
    "gender" "Gender" NOT NULL,
    "dateOfBirth" DATE,
    "admissionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "mobileNumber" VARCHAR(20),
    "parentMobileNumber" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "photoUrl" TEXT,
    "currentMarhalaId" UUID NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicMonthId" UUID NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "markedBy" UUID NOT NULL,
    "markedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "noteDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "title" VARCHAR(150),
    "note" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarhalaHistory" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "fromMarhalaId" UUID,
    "toMarhalaId" UUID NOT NULL,
    "effectiveDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "reason" TEXT,
    "promotedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarhalaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuranSession" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "huffazId" UUID NOT NULL,
    "academicMonthId" UUID NOT NULL,
    "sessionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "sessionType" "SessionType" NOT NULL DEFAULT 'MIXED',
    "siparaNumber" SMALLINT,
    "surahName" VARCHAR(150),
    "murajaahJuz" SMALLINT,
    "murajaahMarks" DECIMAL(5,2),
    "juzHaaliMarks" DECIMAL(5,2),
    "jadeedStartAyah" VARCHAR(20),
    "hifzProgress" VARCHAR(200),
    "durationMinutes" SMALLINT,
    "remarks" TEXT,
    "recordedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuranSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HuffazAttendance" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "academicMonthId" UUID NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "payablePercentage" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "remarks" TEXT,
    "markedBy" UUID NOT NULL,
    "markedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HuffazAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentFeeCollection" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicMonthId" UUID NOT NULL,
    "marhalaFeeConfigurationId" UUID NOT NULL,
    "configuredFee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "waivedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalReceivedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "outstandingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "remarks" TEXT,
    "collectedBy" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" UUID,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StudentFeeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePaymentTransaction" (
    "id" UUID NOT NULL,
    "studentFeeCollectionId" UUID NOT NULL,
    "transactionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paymentMode" VARCHAR(30) NOT NULL DEFAULT 'CASH',
    "referenceNumber" VARCHAR(100),
    "remarks" TEXT,
    "receivedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP,
    "deletedBy" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FeePaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySettlement" (
    "id" UUID NOT NULL,
    "academicMonthId" UUID NOT NULL,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalConfiguredFees" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalDiscountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalWaivedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalCollectedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalPayablePool" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "settlementStatus" "SettlementStatus" NOT NULL DEFAULT 'GENERATED',
    "generatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID NOT NULL,
    "lockedAt" TIMESTAMP,
    "lockedBy" UUID,
    "remarks" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySettlementDetail" (
    "id" UUID NOT NULL,
    "monthlySettlementId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "attendanceDays" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "attendancePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "calculatedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "bonusAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "deductionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "finalPayableAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "remarks" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlySettlementDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementAdjustment" (
    "id" UUID NOT NULL,
    "monthlySettlementDetailId" UUID NOT NULL,
    "adjustmentType" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "reason" TEXT NOT NULL,
    "adjustedBy" UUID NOT NULL,
    "adjustedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicPeriod_name_key" ON "AcademicPeriod"("name");

-- CreateIndex
CREATE INDEX "AcademicPeriod_isCurrent_idx" ON "AcademicPeriod"("isCurrent");

-- CreateIndex
CREATE INDEX "AcademicMonth_academicPeriodId_idx" ON "AcademicMonth"("academicPeriodId");

-- CreateIndex
CREATE INDEX "AcademicMonth_monthNumber_idx" ON "AcademicMonth"("monthNumber");

-- CreateIndex
CREATE INDEX "AcademicMonth_settlementStatus_idx" ON "AcademicMonth"("settlementStatus");

-- CreateIndex
CREATE INDEX "AcademicMonth_isCurrent_idx" ON "AcademicMonth"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicMonth_academicPeriodId_monthNumber_year_key" ON "AcademicMonth"("academicPeriodId", "monthNumber", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Marhala_code_key" ON "Marhala"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Marhala_displayOrder_key" ON "Marhala"("displayOrder");

-- CreateIndex
CREATE INDEX "MarhalaFeeConfiguration_academicPeriodId_idx" ON "MarhalaFeeConfiguration"("academicPeriodId");

-- CreateIndex
CREATE INDEX "MarhalaFeeConfiguration_marhalaId_idx" ON "MarhalaFeeConfiguration"("marhalaId");

-- CreateIndex
CREATE UNIQUE INDEX "MarhalaFeeConfiguration_academicPeriodId_marhalaId_key" ON "MarhalaFeeConfiguration"("academicPeriodId", "marhalaId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_itsNumber_key" ON "Student"("itsNumber");

-- CreateIndex
CREATE INDEX "Student_currentMarhalaId_idx" ON "Student"("currentMarhalaId");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_parentMobileNumber_idx" ON "Student"("parentMobileNumber");

-- CreateIndex
CREATE INDEX "Student_isActive_idx" ON "Student"("isActive");

-- CreateIndex
CREATE INDEX "StudentAttendance_academicMonthId_idx" ON "StudentAttendance"("academicMonthId");

-- CreateIndex
CREATE INDEX "StudentAttendance_attendanceDate_idx" ON "StudentAttendance"("attendanceDate");

-- CreateIndex
CREATE INDEX "StudentAttendance_attendanceStatus_idx" ON "StudentAttendance"("attendanceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_attendanceDate_key" ON "StudentAttendance"("studentId", "attendanceDate");

-- CreateIndex
CREATE INDEX "StudentNote_studentId_idx" ON "StudentNote"("studentId");

-- CreateIndex
CREATE INDEX "StudentNote_noteDate_idx" ON "StudentNote"("noteDate");

-- CreateIndex
CREATE INDEX "StudentNote_createdBy_idx" ON "StudentNote"("createdBy");

-- CreateIndex
CREATE INDEX "MarhalaHistory_studentId_idx" ON "MarhalaHistory"("studentId");

-- CreateIndex
CREATE INDEX "MarhalaHistory_effectiveDate_idx" ON "MarhalaHistory"("effectiveDate");

-- CreateIndex
CREATE INDEX "MarhalaHistory_toMarhalaId_idx" ON "MarhalaHistory"("toMarhalaId");

-- CreateIndex
CREATE INDEX "QuranSession_studentId_idx" ON "QuranSession"("studentId");

-- CreateIndex
CREATE INDEX "QuranSession_huffazId_idx" ON "QuranSession"("huffazId");

-- CreateIndex
CREATE INDEX "QuranSession_academicMonthId_idx" ON "QuranSession"("academicMonthId");

-- CreateIndex
CREATE INDEX "QuranSession_sessionDate_idx" ON "QuranSession"("sessionDate");

-- CreateIndex
CREATE INDEX "QuranSession_sessionType_idx" ON "QuranSession"("sessionType");

-- CreateIndex
CREATE INDEX "HuffazAttendance_academicMonthId_idx" ON "HuffazAttendance"("academicMonthId");

-- CreateIndex
CREATE INDEX "HuffazAttendance_attendanceDate_idx" ON "HuffazAttendance"("attendanceDate");

-- CreateIndex
CREATE INDEX "HuffazAttendance_attendanceStatus_idx" ON "HuffazAttendance"("attendanceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "HuffazAttendance_userId_attendanceDate_key" ON "HuffazAttendance"("userId", "attendanceDate");

-- CreateIndex
CREATE INDEX "StudentFeeCollection_studentId_idx" ON "StudentFeeCollection"("studentId");

-- CreateIndex
CREATE INDEX "StudentFeeCollection_academicMonthId_idx" ON "StudentFeeCollection"("academicMonthId");

-- CreateIndex
CREATE INDEX "StudentFeeCollection_paymentStatus_idx" ON "StudentFeeCollection"("paymentStatus");

-- CreateIndex
CREATE INDEX "StudentFeeCollection_collectedBy_idx" ON "StudentFeeCollection"("collectedBy");

-- CreateIndex
CREATE UNIQUE INDEX "StudentFeeCollection_studentId_academicMonthId_key" ON "StudentFeeCollection"("studentId", "academicMonthId");

-- CreateIndex
CREATE INDEX "FeePaymentTransaction_studentFeeCollectionId_idx" ON "FeePaymentTransaction"("studentFeeCollectionId");

-- CreateIndex
CREATE INDEX "FeePaymentTransaction_transactionDate_idx" ON "FeePaymentTransaction"("transactionDate");

-- CreateIndex
CREATE INDEX "FeePaymentTransaction_receivedBy_idx" ON "FeePaymentTransaction"("receivedBy");

-- CreateIndex
CREATE INDEX "FeePaymentTransaction_paymentMode_idx" ON "FeePaymentTransaction"("paymentMode");

-- CreateIndex
CREATE INDEX "FeePaymentTransaction_studentFeeCollectionId_transactionDat_idx" ON "FeePaymentTransaction"("studentFeeCollectionId", "transactionDate");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySettlement_academicMonthId_key" ON "MonthlySettlement"("academicMonthId");

-- CreateIndex
CREATE INDEX "MonthlySettlement_settlementStatus_idx" ON "MonthlySettlement"("settlementStatus");

-- CreateIndex
CREATE INDEX "MonthlySettlement_generatedBy_idx" ON "MonthlySettlement"("generatedBy");

-- CreateIndex
CREATE INDEX "MonthlySettlementDetail_userId_idx" ON "MonthlySettlementDetail"("userId");

-- CreateIndex
CREATE INDEX "MonthlySettlementDetail_finalPayableAmount_idx" ON "MonthlySettlementDetail"("finalPayableAmount");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySettlementDetail_monthlySettlementId_userId_key" ON "MonthlySettlementDetail"("monthlySettlementId", "userId");

-- CreateIndex
CREATE INDEX "SettlementAdjustment_monthlySettlementDetailId_idx" ON "SettlementAdjustment"("monthlySettlementDetailId");

-- CreateIndex
CREATE INDEX "SettlementAdjustment_adjustedBy_idx" ON "SettlementAdjustment"("adjustedBy");

-- CreateIndex
CREATE INDEX "SettlementAdjustment_adjustedAt_idx" ON "SettlementAdjustment"("adjustedAt");

-- AddForeignKey
ALTER TABLE "AcademicMonth" ADD CONSTRAINT "AcademicMonth_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaFeeConfiguration" ADD CONSTRAINT "MarhalaFeeConfiguration_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "AcademicPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaFeeConfiguration" ADD CONSTRAINT "MarhalaFeeConfiguration_marhalaId_fkey" FOREIGN KEY ("marhalaId") REFERENCES "Marhala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_currentMarhalaId_fkey" FOREIGN KEY ("currentMarhalaId") REFERENCES "Marhala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaHistory" ADD CONSTRAINT "MarhalaHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaHistory" ADD CONSTRAINT "MarhalaHistory_fromMarhalaId_fkey" FOREIGN KEY ("fromMarhalaId") REFERENCES "Marhala"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaHistory" ADD CONSTRAINT "MarhalaHistory_toMarhalaId_fkey" FOREIGN KEY ("toMarhalaId") REFERENCES "Marhala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarhalaHistory" ADD CONSTRAINT "MarhalaHistory_promotedBy_fkey" FOREIGN KEY ("promotedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranSession" ADD CONSTRAINT "QuranSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranSession" ADD CONSTRAINT "QuranSession_huffazId_fkey" FOREIGN KEY ("huffazId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranSession" ADD CONSTRAINT "QuranSession_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuranSession" ADD CONSTRAINT "QuranSession_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuffazAttendance" ADD CONSTRAINT "HuffazAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuffazAttendance" ADD CONSTRAINT "HuffazAttendance_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HuffazAttendance" ADD CONSTRAINT "HuffazAttendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeCollection" ADD CONSTRAINT "StudentFeeCollection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeCollection" ADD CONSTRAINT "StudentFeeCollection_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeCollection" ADD CONSTRAINT "StudentFeeCollection_marhalaFeeConfigurationId_fkey" FOREIGN KEY ("marhalaFeeConfigurationId") REFERENCES "MarhalaFeeConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentFeeCollection" ADD CONSTRAINT "StudentFeeCollection_collectedBy_fkey" FOREIGN KEY ("collectedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePaymentTransaction" ADD CONSTRAINT "FeePaymentTransaction_studentFeeCollectionId_fkey" FOREIGN KEY ("studentFeeCollectionId") REFERENCES "StudentFeeCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePaymentTransaction" ADD CONSTRAINT "FeePaymentTransaction_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlement" ADD CONSTRAINT "MonthlySettlement_academicMonthId_fkey" FOREIGN KEY ("academicMonthId") REFERENCES "AcademicMonth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlement" ADD CONSTRAINT "MonthlySettlement_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlement" ADD CONSTRAINT "MonthlySettlement_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlementDetail" ADD CONSTRAINT "MonthlySettlementDetail_monthlySettlementId_fkey" FOREIGN KEY ("monthlySettlementId") REFERENCES "MonthlySettlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySettlementDetail" ADD CONSTRAINT "MonthlySettlementDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAdjustment" ADD CONSTRAINT "SettlementAdjustment_monthlySettlementDetailId_fkey" FOREIGN KEY ("monthlySettlementDetailId") REFERENCES "MonthlySettlementDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAdjustment" ADD CONSTRAINT "SettlementAdjustment_adjustedBy_fkey" FOREIGN KEY ("adjustedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
