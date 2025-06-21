import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/services/userService';
import { getSessionUser } from '@/services/authService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 401 }
      );
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not in a team.' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const targetUser = await getUserById(id, user.teamId);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: targetUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 401 }
      );
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Only administrators can edit users.' },
        { status: 403 }
      );
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not in a team.' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updatedUser = await updateUser(id, user.teamId, body);
    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 401 }
      );
    }

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not in a team.' },
        { status: 400 }
      );
    }

    const { id } = await params;
    await deleteUser(id, user.teamId);

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 400 }
    );
  }
} 