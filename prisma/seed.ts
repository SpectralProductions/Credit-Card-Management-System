import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default roles
  console.log('Creating default roles...');
  const roles = [
    {
      name: 'Admin',
      description: 'Administrator with full access',
    },
    {
      name: 'Member',
      description: 'Regular member with limited access',
    },
  ];

  const createdRoles = await Promise.all(
    roles.map(async (role) => {
      return prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: {
          name: role.name,
          description: role.description,
        },
      });
    })
  );

  // Create default users
  console.log('Creating default users...');
  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'Admin',
    },
    {
      name: 'Member User',
      email: 'member@example.com',
      password: await bcrypt.hash('member123', 10),
      role: 'Member',
    },
  ];

  for (const userData of defaultUsers) {
    const { role, ...userInfo } = userData;
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {},
      create: {
        ...userInfo,
        emailVerified: new Date(),
      },
    });

    // Find role
    const userRole = createdRoles.find((r) => r.name === role);
    if (!userRole) continue;

    // Assign role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id,
      },
    });
  }

  console.log('Seeding completed.');
  console.log('Default users created:');
  console.log('Admin - Email: admin@example.com, Password: admin123');
  console.log('Member - Email: member@example.com, Password: member123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 