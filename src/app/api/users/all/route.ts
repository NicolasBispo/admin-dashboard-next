import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/services/userService';
import { getAuthenticatedUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN']);
    
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 403 }
    );
  }
} 