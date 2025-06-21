import { PrismaClient, AuditAction, Prisma } from '@/lib/prisma';

const prisma = new PrismaClient();

interface AuditLogData {
  userId: string;
  teamId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        teamId: data.teamId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
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
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Não falhar a operação principal se o log falhar
    return null;
  }
}

export async function getAuditLogs(
  userId?: string,
  teamId?: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const where: Prisma.AuditLogWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (teamId) {
      where.teamId = teamId;
    }

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

    return auditLogs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }
}

export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action,
      },
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

    return auditLogs;
  } catch (error) {
    console.error('Error fetching audit logs by action:', error);
    throw new Error('Failed to fetch audit logs');
  }
}

// Funções auxiliares para criar logs específicos
export async function logUserLogin(userId: string, ipAddress?: string, userAgent?: string) {
  return createAuditLog({
    userId,
    action: AuditAction.LOGIN,
    entityType: 'user',
    entityId: userId,
    description: 'User logged in',
    ipAddress,
    userAgent,
  });
}

export async function logUserLogout(userId: string, ipAddress?: string, userAgent?: string) {
  return createAuditLog({
    userId,
    action: AuditAction.LOGOUT,
    entityType: 'user',
    entityId: userId,
    description: 'User logged out',
    ipAddress,
    userAgent,
  });
}

export async function logUserCreated(createdBy: string, newUserId: string, teamId?: string) {
  return createAuditLog({
    userId: createdBy,
    teamId,
    action: AuditAction.CREATE,
    entityType: 'user',
    entityId: newUserId,
    description: 'New user created',
  });
}

export async function logUserUpdated(updatedBy: string, userId: string, teamId?: string, changes?: Record<string, unknown>) {
  return createAuditLog({
    userId: updatedBy,
    teamId,
    action: AuditAction.UPDATE,
    entityType: 'user',
    entityId: userId,
    description: 'User information updated',
    metadata: changes,
  });
}

export async function logRoleChanged(changedBy: string, userId: string, oldRole: string, newRole: string, teamId?: string) {
  return createAuditLog({
    userId: changedBy,
    teamId,
    action: AuditAction.ROLE_CHANGED,
    entityType: 'user',
    entityId: userId,
    description: 'User role changed',
    metadata: { oldRole, newRole },
  });
}

export async function logStatusChanged(changedBy: string, userId: string, oldStatus: boolean, newStatus: boolean, teamId?: string) {
  return createAuditLog({
    userId: changedBy,
    teamId,
    action: AuditAction.STATUS_CHANGED,
    entityType: 'user',
    entityId: userId,
    description: 'User status changed',
    metadata: { oldStatus, newStatus },
  });
}

export async function logInviteSent(sentBy: string, teamId: string, invitedUserId: string) {
  return createAuditLog({
    userId: sentBy,
    teamId,
    action: AuditAction.INVITE_SENT,
    entityType: 'invite',
    entityId: invitedUserId,
    description: 'Team invite sent',
  });
}

export async function logInviteAccepted(userId: string, teamId: string) {
  return createAuditLog({
    userId,
    teamId,
    action: AuditAction.INVITE_ACCEPTED,
    entityType: 'invite',
    description: 'Team invite accepted',
  });
}

export async function logInviteDeclined(userId: string, teamId: string) {
  return createAuditLog({
    userId,
    teamId,
    action: AuditAction.INVITE_DECLINED,
    entityType: 'invite',
    description: 'Team invite declined',
  });
}

export async function logRequestSent(userId: string, teamId: string) {
  return createAuditLog({
    userId,
    teamId,
    action: AuditAction.REQUEST_SENT,
    entityType: 'request',
    description: 'Team join request sent',
  });
}

export async function logRequestApproved(approvedBy: string, userId: string, teamId: string) {
  return createAuditLog({
    userId: approvedBy,
    teamId,
    action: AuditAction.REQUEST_APPROVED,
    entityType: 'request',
    entityId: userId,
    description: 'Team join request approved',
  });
}

export async function logRequestRejected(rejectedBy: string, userId: string, teamId: string) {
  return createAuditLog({
    userId: rejectedBy,
    teamId,
    action: AuditAction.REQUEST_REJECTED,
    entityType: 'request',
    entityId: userId,
    description: 'Team join request rejected',
  });
} 