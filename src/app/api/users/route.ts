import { NextRequest, NextResponse } from 'next/server';
import { getUsersByTeam, createUser } from '@/services/userService';
import { getAuthenticatedUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER']);
    
    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User does not have a team' },
        { status: 403 }
      );
    }
    
    const users = await getUsersByTeam(user.teamId);
    return NextResponse.json(users);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN', 'ADMIN']);
    
    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User does not have a team' },
        { status: 403 }
      );
    }
    
    const { name, email, password, role } = await req.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 400 }
    );
  }
} 