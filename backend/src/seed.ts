import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        createdBy: 'SYSTEM',
        updatedBy: 'SYSTEM',
      }
    });
    console.log(`Created admin user: ${admin.username} / Password@123`);
  } else {
    console.log('Admin user already exists.');
  }

  // Seed Marhalas
  const marhalas = [
    { code: 'ULA', name: 'Marhala Ula' },
    { code: 'SANIYAH', name: 'Marhala Saniyah' },
    { code: 'SALESAH', name: 'Marhala Salesah' },
    { code: 'RABEAH', name: 'Marhala Rabeah' },
    { code: 'KHAMESAH', name: 'Marhala Khamesah' },
    { code: 'SADESAH', name: 'Marhala Sadesa' },
  ];

  for (const m of marhalas) {
    const existing = await prisma.marhala.findFirst({ where: { code: m.code as any } });
    if (!existing) {
      await prisma.marhala.create({
        data: {
          code: m.code as any,
          name: m.name,
          description: m.name,
          createdBy: 'SYSTEM',
          updatedBy: 'SYSTEM',
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
