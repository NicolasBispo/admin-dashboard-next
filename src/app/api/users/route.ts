import { NextRequest, NextResponse } from 'next/server';
import { getUsersByTeam, createUser } from '@/services/userService';
import { getAuthenticatedUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
    
    if (!user.teamId) {
      return NextResponse.json(
        { error: 'Usuário não possui time' },
        { status: 400 }
      );
    }
    
    const users = await getUsersByTeam(user.teamId);
    return NextResponse.json(users);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('autenticado') ? 401 : 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN', 'ADMIN']);
    
    if (!user.teamId) {
      return NextResponse.json(
        { error: 'Usuário não possui time' },
        { status: 400 }
      );
    }
    
    const { name, email, password, role } = await req.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    const newUser = await createUser({
      name,
      email,
      password,
      role,
      teamId: user.teamId,
    });
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('autenticado') ? 401 : 400 }
    );
  }
} 