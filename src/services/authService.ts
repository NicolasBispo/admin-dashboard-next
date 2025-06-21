import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function signup(email: string, password: string, name: string) {
  if (!email || !password || !name) {
    throw new Error('Email, senha e nome são obrigatórios.');
  }

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Usuário com este email já existe.');
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userSafe } = user;
  return userSafe;
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Email e senha são obrigatórios.');
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new Error('Usuário ou senha inválidos.');
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Usuário ou senha inválidos.');
  }
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });
  return { token, expiresAt };
}

export async function logout(token: string) {
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { 
      user: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  users: true,
                },
              },
            },
          },
          createdTeams: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
              _count: {
                select: {
                  users: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userSafe } = session.user;
  return userSafe;
} 