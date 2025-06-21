import { NextRequest, NextResponse } from 'next/server';
import { getTeamRequests, getTeamById } from '@/services/teamService';
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

    // Verificar se o usuário é o criador do time
    if (team.createdBy !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado.' },
        { status: 403 }
      );
    }

    const requests = await getTeamRequests(teamId);
    return NextResponse.json({ requests });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 