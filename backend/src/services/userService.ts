import prisma from '../lib/prisma';

// Identify user by phone — create if not exists
export const identifyUser = async (phone: string) => {
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });
  return user;
};

// Get user by ID
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};
