import { NextRequest } from 'next/server';
import { getSessionUser } from '@/services/authService';

interface TeamRolePartial {
  id?: string;
  teamId?: string;
  name?: string;
  isActive?: boolean;
  color?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Team {
  id?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    users: number;
  };
  teamRole?: TeamRolePartial;
}

interface CreatedTeam {
  id?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  _count?: {
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
  team?: (Team & { teamRole?: TeamRolePartial }) | null;
  createdTeams: CreatedTeam[];
  teamRoles?: TeamRolePartial[];
}

export async function getAuthenticatedUser(req: NextRequest) {
  const sessionToken = req.cookies.get('session-token')?.value;
  const user = await getSessionUser(sessionToken);
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

export function requireRole(user: User, allowedRoles: string[]) {
  console.log('user', user);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Access denied');
  }
} 