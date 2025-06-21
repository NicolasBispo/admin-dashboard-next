import { NextRequest, NextResponse } from 'next/server';
import { createTeamRequest, getUserTeamRequests } from '@/services/teamService';
import { getSessionUser } from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado.' },
        { status: 401 }
      );
    }

    const requests = await getUserTeamRequests(user.id);
    return NextResponse.json({ requests });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const token = _request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado.' },
        { status: 401 }
      );
    }

    const { teamId, message } = await _request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'ID do time é obrigatório.' },
        { status: 400 }
      );
    }

    const request = await createTeamRequest({
      teamId,
      userId: user.id,
      message,
    });

    return NextResponse.json({ request });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 