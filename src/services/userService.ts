import { PrismaClient, UserRole } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getUsersByTeam(teamId: string) {
  return await prisma.user.findMany({
    where: { teamId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserById(id: string, teamId: string) {
  return await prisma.user.findFirst({
    where: { id, teamId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teamId: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new Error('Email já está em uso.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  teamId: string,
  data: {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
  }
) {
  const user = await prisma.user.findFirst({
    where: { id, teamId, isActive: true },
  });
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error('Email já está em uso.');
    }
  }

  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteUser(id: string, teamId: string) {
  const user = await prisma.user.findFirst({
    where: { id, teamId, isActive: true },
  });
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  // Soft delete - apenas marca como inativo
  return await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function changePassword(
  id: string,
  teamId: string,
  newPassword: string
) {
  const user = await prisma.user.findFirst({
    where: { id, teamId, isActive: true },
  });
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
} 