import { NextRequest } from 'next/server';
import { getSessionUser } from '@/services/authService';

interface Team {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    users: number;
  };
}

interface CreatedTeam {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: {
    users: number;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  teamId: string | null;
  isActive: boolean;
  team?: Team | null;
  createdTeams: CreatedTeam[];
}

export async function getAuthenticatedUser(req: NextRequest) {
  const sessionToken = req.cookies.get('session-token')?.value;
  const user = await getSessionUser(sessionToken);
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  return user;
}

export function requireRole(user: User, allowedRoles: string[]) {
  console.log('user', user);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Acesso negado');
  }
} 