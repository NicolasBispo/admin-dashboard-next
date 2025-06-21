import { NextRequest, NextResponse } from 'next/server';
import { approveTeamRequest, rejectTeamRequest, cancelTeamRequest } from '@/services/teamService';
import { getSessionUser } from '@/services/authService';

export async function PUT(
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

    const { id } = await params;
    const { action } = await request.json();

    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida.' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'approve':
        result = await approveTeamRequest(id);
        break;
      case 'reject':
        result = await rejectTeamRequest(id);
        break;
      case 'cancel':
        result = await cancelTeamRequest(id);
        break;
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 