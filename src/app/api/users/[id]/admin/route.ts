import { NextRequest, NextResponse } from 'next/server';
import { updateUserById } from '@/services/userService';
import { getAuthenticatedUser, requireRole } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    requireRole(user, ['SUPER_ADMIN']);

    const { id } = await params;
    const body = await request.json();

    const updatedUser = await updateUserById(id, body);
    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 400 }
    );
  }
} 