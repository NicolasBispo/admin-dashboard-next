import { PrismaClient } from '@/lib/prisma';
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
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userSafe } = user;
  return { token, expiresAt, user: userSafe };
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
          UserTeamRole: {
            include: {
              teamRole: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  isActive: true,
                  teamId: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  
  // Filtrar apenas os teamRoles do time atual do usuário
  const userTeamRoles = session.user.UserTeamRole.filter(
    userTeamRole => userTeamRole.teamRole.teamId === session.user.teamId
  );
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, UserTeamRole: _userTeamRole, ...userSafe } = session.user;
  console.log('userSafe', userSafe);
  
  return {
    ...userSafe,
    team: userSafe.team && Object.keys(userSafe.team).length > 0 ? {
      ...userSafe.team,
      teamRole: userTeamRoles.find(utr => utr.teamRole.teamId === userSafe.team?.id)?.teamRole
    } : null,
    teamRoles: userTeamRoles.map(utr => utr.teamRole)
  };
} 