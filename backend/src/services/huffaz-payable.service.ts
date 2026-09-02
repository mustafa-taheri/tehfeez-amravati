import { prisma } from "../utils/db.js";

type ActiveHuffaz = {
  id: string;
  fullName: string;
};

type HuffazAttendanceRecord = {
  userId: string;
  attendanceDate: Date;
  attendanceStatus: string;
};

export type HuffazPayableResult = {
  userId: string;
  fullName: string;
  attendanceDays: number;
  attendancePercentage: number;
  calculatedAmount: number;
};

type AttendanceDay = {
  totalPoints: number;
  pointsByHuffaz: Map<string, number>;
};

const getAttendancePoints = (attendanceStatus: string): number => {
  switch (attendanceStatus) {
    case "PRESENT":
      return 1;

    case "HALF_DAY":
      return 0.5;

    case "ABSENT":
    case "LEAVE":
    case "UZUR":
    default:
      return 0;
  }
};

const formatAttendanceDate = (date: Date | string): string => {
  const value = new Date(date);

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

export const calculateHuffazPayables = (
  activeHuffaz: ActiveHuffaz[],
  attendanceRecords: HuffazAttendanceRecord[],
  totalCollectedAmount: number,
  workingDays: number,
): HuffazPayableResult[] => {
  const huffazStats = new Map<
    string,
    {
      attendanceDays: number;
      payablePoints: number;
      calculatedAmount: number;
      fullName: string;
    }
  >();

  for (const huffaz of activeHuffaz) {
    huffazStats.set(huffaz.id, {
      attendanceDays: 0,
      payablePoints: 0,
      calculatedAmount: 0,
      fullName: huffaz.fullName,
    });
  }

  if (workingDays <= 0 || totalCollectedAmount <= 0) {
    return Array.from(huffazStats.entries()).map(([userId, stats]) => ({
      userId,
      fullName: stats.fullName,
      attendanceDays: 0,
      attendancePercentage: 0,
      calculatedAmount: 0,
    }));
  }

  /*
   * IMPORTANT:
   *
   * Do not round the daily pool.
   *
   * Example:
   *
   * 2650 / 22
   * = 120.454545...
   *
   * Keep the precision internally and round
   * only the final payable amount.
   */
  const dailyPool = totalCollectedAmount / workingDays;

  const attendanceByDay = new Map<string, AttendanceDay>();

  for (const record of attendanceRecords) {
    const dateKey = formatAttendanceDate(record.attendanceDate);

    const points = getAttendancePoints(record.attendanceStatus);

    let dayEntry = attendanceByDay.get(dateKey);

    if (!dayEntry) {
      dayEntry = {
        totalPoints: 0,
        pointsByHuffaz: new Map(),
      };

      attendanceByDay.set(dateKey, dayEntry);
    }

    dayEntry.totalPoints += points;

    dayEntry.pointsByHuffaz.set(
      record.userId,
      (dayEntry.pointsByHuffaz.get(record.userId) ?? 0) + points,
    );
  }

  /*
   * Process attendance chronologically because
   * carry-forward depends on previous days.
   */
  const sortedDates = Array.from(attendanceByDay.keys()).sort();

  let carryForwardPool = 0;

  for (const dateKey of sortedDates) {
    const dayEntry = attendanceByDay.get(dateKey);

    if (!dayEntry) {
      continue;
    }

    /*
     * Today's pool includes everything carried
     * forward from previous non-payable days.
     */
    const availablePool = dailyPool + carryForwardPool;

    /*
     * Nobody was payable today.
     *
     * Carry the complete pool to the next
     * payable day.
     */
    if (dayEntry.totalPoints <= 0) {
      carryForwardPool = availablePool;
      continue;
    }

    const valuePerPoint = availablePool / dayEntry.totalPoints;

    for (const [userId, points] of dayEntry.pointsByHuffaz.entries()) {
      if (points <= 0) {
        continue;
      }

      const stats = huffazStats.get(userId);

      if (!stats) {
        continue;
      }

      /*
       * Attendance days:
       *
       * PRESENT = 1
       * HALF_DAY = 0.5
       */
      stats.attendanceDays += points;

      stats.payablePoints += points;

      /*
       * Do NOT round individual daily
       * allocations.
       */
      stats.calculatedAmount += valuePerPoint * points;
    }

    /*
     * The carried pool has now been consumed.
     */
    carryForwardPool = 0;
  }

  return Array.from(huffazStats.entries()).map(([userId, stats]) => ({
    userId,
    fullName: stats.fullName,

    attendanceDays: roundToTwo(stats.attendanceDays),

    attendancePercentage:
      workingDays > 0
        ? roundToTwo((stats.payablePoints / workingDays) * 100)
        : 0,

    calculatedAmount: roundToTwo(stats.calculatedAmount),
  }));
};

export const calculateMonthlyHuffazPayables = async (
  academicMonthId: string,
) => {
  const academicMonth = await prisma.academicMonth.findUnique({
    where: {
      id: academicMonthId,
    },
  });

  if (!academicMonth) {
    throw new Error("Academic month not found.");
  }

  const workingDays = Number(academicMonth.workingDays);

  if (workingDays <= 0) {
    throw new Error("Academic month must have at least one working day.");
  }

  const [feeCollections, attendanceRecords, activeHuffaz] = await Promise.all([
    prisma.studentFeeCollection.findMany({
      where: {
        academicMonthId,
        isActive: true,
      },
    }),

    prisma.huffazAttendance.findMany({
      where: {
        academicMonthId,
      },
      orderBy: {
        attendanceDate: "asc",
      },
    }),

    prisma.user.findMany({
      where: {
        role: "HUFFAZ",
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    }),
  ]);

  const totalCollectedAmount = roundToTwo(
    feeCollections.reduce(
      (sum, collection) => sum + Number(collection.totalReceivedAmount ?? 0),
      0,
    ),
  );

  const dailyPool = totalCollectedAmount / workingDays;

  const huffazPayables = calculateHuffazPayables(
    activeHuffaz,
    attendanceRecords,
    totalCollectedAmount,
    workingDays,
  );

  return {
    academicMonth,
    workingDays,
    totalCollectedAmount,
    dailyPool,
    huffazPayables,
  };
};
