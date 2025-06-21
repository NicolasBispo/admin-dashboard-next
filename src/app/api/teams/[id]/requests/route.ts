import { NextRequest, NextResponse } from 'next/server';
import { getTeamRequests, getTeamById, canManageTeamRequests } from '@/services/teamService';
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

    const canManageTeam = await canManageTeamRequests(user.id, teamId);
    // Verificar se o usuário tem permissão para gerenciar solicitações
    if (team.creator.id !== user.id && !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role) && !canManageTeam) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to manage requests for this team.' },
        { status: 403 }
      );
    }

    const requests = await getTeamRequests(teamId);
    return NextResponse.json({ requests });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 