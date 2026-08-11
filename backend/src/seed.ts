import { prisma } from "./utils/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding initial data...");

  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const admin = await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        fullName: "System Admin",
        username: "admin",
        mobileNumber: "0000000000",
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log(`Created admin user: ${admin.username} / Password@123`);
  } else {
    console.log("Admin user already exists.");
  }

  // Seed Marhalas
  const marhalas = [
    { code: "ULA", name: "Marhala Ula", displayOrder: 1 },
    { code: "SANIYAH", name: "Marhala Saniyah", displayOrder: 2 },
    { code: "SALESAH", name: "Marhala Salesah", displayOrder: 3 },
    { code: "RABEAH", name: "Marhala Rabeah", displayOrder: 4 },
    { code: "KHAMESAH", name: "Marhala Khamesah", displayOrder: 5 },
    { code: "SADESAH", name: "Marhala Sadesa", displayOrder: 6 },
  ];

  for (const m of marhalas) {
    const existing = await prisma.marhala.findFirst({
      where: { code: m.code as any },
    });
    if (!existing) {
      await prisma.marhala.create({
        data: {
          code: m.code as any,
          name: m.name,
          displayOrder: m.displayOrder,
          description: m.name,
        },
      });
      console.log(`Created Marhala: ${m.name}`);
    }
  }

  const currentYear = new Date().getFullYear();
  const currentPeriod = await prisma.academicPeriod.findFirst({
    where: { isCurrent: true },
  });

  if (!currentPeriod) {
    const period = await prisma.academicPeriod.create({
      data: {
        name: `${currentYear}-Academic-Year`,
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 11, 31),
        isCurrent: true,
        isActive: true,
      },
    });

    await prisma.academicMonth.create({
      data: {
        academicPeriodId: period.id,
        name: "Muharram",
        monthNumber: 1,
        year: currentYear,
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 0, 31),
        workingDays: 22,
        isCurrent: true,
        isActive: true,
      },
    });

    console.log(`Created academic period and month for ${currentYear}`);
  }

  const marhalaUla = await prisma.marhala.findFirst({
    where: { code: "ULA" as any },
  });
  if (marhalaUla) {
    const existingStudent = await prisma.student.findUnique({
      where: { itsNumber: "ITS001" },
    });
    if (!existingStudent) {
      await prisma.student.create({
        data: {
          itsNumber: "ITS001",
          firstName: "Ammar",
          lastName: "Hussain",
          fullName: "Ammar Hussain",
          fatherName: "Hussain",
          gender: "MALE",
          mobileNumber: "1234567890",
          parentMobileNumber: "1234567890",
          address: "Sample Address",
          currentMarhalaId: marhalaUla.id,
          status: "ACTIVE",
          remarks: "Seeded sample student",
        },
      });
      console.log("Created sample student ITS001");
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
