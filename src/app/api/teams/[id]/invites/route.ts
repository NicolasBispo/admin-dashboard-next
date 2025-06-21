import { NextRequest, NextResponse } from 'next/server';
import { getTeamInvites, getTeamById } from '@/services/teamService';
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

    const { id: teamId } = await params;
    const team = await getTeamById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found.' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para gerenciar convites
    if (team.creator.id !== user.id && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to manage invites for this team.' },
        { status: 403 }
      );
    }

    const invites = await getTeamInvites(teamId);
    return NextResponse.json({ invites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 