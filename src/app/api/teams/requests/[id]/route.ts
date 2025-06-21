import { NextRequest, NextResponse } from 'next/server';
import { approveTeamRequest, rejectTeamRequest, cancelTeamRequest, canManageTeamRequests } from '@/services/teamService';
import { getSessionUser } from '@/services/authService';
import { PrismaClient } from '@/lib/prisma';

const prisma = new PrismaClient();

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

    const { id } = await params;
    const { action } = await request.json();

    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action.' },
        { status: 400 }
      );
    }

    // Buscar a solicitação para obter o teamId
    const teamRequest = await prisma.teamRequest.findUnique({
      where: { id },
      select: { teamId: true },
    });

    if (!teamRequest) {
      return NextResponse.json(
        { error: 'Request not found.' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para gerenciar solicitações
    const hasPermission = await canManageTeamRequests(user.id, teamRequest.teamId);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to manage requests for this team.' },
        { status: 403 }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 