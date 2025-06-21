import { NextRequest, NextResponse } from 'next/server';
import { getTeamInvites, getTeamById, canManageTeamRequests } from '@/services/teamService';
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
        { error: 'Não autorizado.' },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;
    const team = await getTeamById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Time não encontrado.' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para gerenciar convites
    const hasPermission = await canManageTeamRequests(user.id, teamId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Acesso negado. Você não tem permissão para gerenciar convites deste time.' },
        { status: 403 }
      );
    }

    const invites = await getTeamInvites(teamId);
    return NextResponse.json({ invites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 