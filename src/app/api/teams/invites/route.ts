import { NextRequest, NextResponse } from 'next/server';
import { createTeamInvite, getUserTeamInvites } from '@/services/teamService';
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

    const invites = await getUserTeamInvites(user.id);
    return NextResponse.json({ invites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado.' },
        { status: 401 }
      );
    }

    const { teamId, userId, message } = await request.json();

    if (!teamId || !userId) {
      return NextResponse.json(
        { error: 'ID do time e ID do usuário são obrigatórios.' },
        { status: 400 }
      );
    }

    const invite = await createTeamInvite({
      teamId,
      userId,
      invitedBy: user.id,
      message,
    });

    return NextResponse.json({ invite });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
} 