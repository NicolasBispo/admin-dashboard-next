import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, requireRole } from '@/lib/auth';
import { PrismaClient, AuditAction, Prisma } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    requireRole(user, ['SUPER_ADMIN', 'ADMIN']);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const search = searchParams.get('search') || undefined;

    const offset = (page - 1) * limit;

    // Construir filtros para a consulta
    const where: Prisma.AuditLogWhereInput = {};
    
    if (action) {
      where.action = action as AuditAction;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (search) {
      where.description = {
        contains: search
      };
    }

    const prisma = new PrismaClient();

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.auditLog.count({ where });

    return NextResponse.json({
      logs: auditLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage.includes('authenticated') ? 401 : 403 }
    );
  }
} 