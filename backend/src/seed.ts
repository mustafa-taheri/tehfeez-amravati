import { prisma } from './utils/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const admin = await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        fullName: 'System Admin',
        username: 'admin',
        mobileNumber: '0000000000',
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      }
    });
    console.log(`Created admin user: ${admin.username} / Password@123`);
  } else {
    console.log('Admin user already exists.');
  }

  // Seed Marhalas
  const marhalas = [
    { code: 'ULA', name: 'Marhala Ula', displayOrder: 1 },
    { code: 'SANIYAH', name: 'Marhala Saniyah', displayOrder: 2 },
    { code: 'SALESAH', name: 'Marhala Salesah', displayOrder: 3 },
    { code: 'RABEAH', name: 'Marhala Rabeah', displayOrder: 4 },
    { code: 'KHAMESAH', name: 'Marhala Khamesah', displayOrder: 5 },
    { code: 'SADESAH', name: 'Marhala Sadesa', displayOrder: 6 },
  ];

  for (const m of marhalas) {
    const existing = await prisma.marhala.findFirst({ where: { code: m.code as any } });
    if (!existing) {
      await prisma.marhala.create({
        data: {
          code: m.code as any,
          name: m.name,
          displayOrder: m.displayOrder,
          description: m.name,
        }
      });
      console.log(`Created Marhala: ${m.name}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
