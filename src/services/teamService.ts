import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export interface CreateTeamData {
  name: string;
  description?: string;
  createdBy: string;
}

export interface CreateTeamRequestData {
  teamId: string;
  userId: string;
  message?: string;
}

export interface CreateTeamInviteData {
  teamId: string;
  userId: string;
  invitedBy: string;
  message?: string;
}

export async function createTeam(data: CreateTeamData) {
  return await prisma.team.create({
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getTeams() {
  return await prisma.team.findMany({
    where: { isActive: true },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });
}

export async function getTeamById(id: string) {
  return await prisma.team.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      teamRoles: true,
    },
  });
}

export async function createTeamRequest(data: CreateTeamRequestData) {
  // Verificar se já existe uma solicitação pendente
  const existingRequest = await prisma.teamRequest.findUnique({
    where: {
      teamId_userId: {
        teamId: data.teamId,
        userId: data.userId,
      },
    },
  });

  if (existingRequest) {
    throw new Error('Você já possui uma solicitação pendente para este time.');
  }

  return await prisma.teamRequest.create({
    data,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function createTeamInvite(data: CreateTeamInviteData) {
  // Verificar se já existe um convite pendente
  const existingInvite = await prisma.teamInvite.findUnique({
    where: {
      teamId_userId: {
        teamId: data.teamId,
        userId: data.userId,
      },
    },
  });

  if (existingInvite) {
    throw new Error('Já existe um convite pendente para este usuário.');
  }

  return await prisma.teamInvite.create({
    data,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getTeamRequests(teamId: string) {
  return await prisma.teamRequest.findMany({
    where: { 
      teamId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeamInvites(teamId: string) {
  return await prisma.teamInvite.findMany({
    where: { 
      teamId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserTeamRequests(userId: string) {
  return await prisma.teamRequest.findMany({
    where: { 
      userId,
      status: 'PENDING',
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserTeamInvites(userId: string) {
  return await prisma.teamInvite.findMany({
    where: { 
      userId,
      status: 'PENDING',
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveTeamRequest(requestId: string) {
  const request = await prisma.teamRequest.findUnique({
    where: { id: requestId },
    include: { team: true, user: true },
  });

  if (!request) {
    throw new Error('Solicitação não encontrada.');
  }

  if (request.status !== 'PENDING') {
    throw new Error('Solicitação já foi processada.');
  }

  // Verificar se o usuário já está em um time
  if (request.user.teamId) {
    throw new Error('Usuário já está em um time.');
  }

  // Aprovar a solicitação
  await prisma.teamRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' },
  });

  // Adicionar usuário ao time
  await prisma.user.update({
    where: { id: request.userId },
    data: { teamId: request.teamId },
  });

  // Rejeitar todas as outras solicitações pendentes do usuário
  await prisma.teamRequest.updateMany({
    where: {
      userId: request.userId,
      status: 'PENDING',
      id: { not: requestId },
    },
    data: { status: 'REJECTED' },
  });

  // Rejeitar todos os convites pendentes do usuário
  await prisma.teamInvite.updateMany({
    where: {
      userId: request.userId,
      status: 'PENDING',
    },
    data: { status: 'DECLINED' },
  });

  return request;
}

export async function rejectTeamRequest(requestId: string) {
  const request = await prisma.teamRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('Solicitação não encontrada.');
  }

  if (request.status !== 'PENDING') {
    throw new Error('Solicitação já foi processada.');
  }

  return await prisma.teamRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });
}

export async function acceptTeamInvite(inviteId: string) {
  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
    include: { team: true, user: true },
  });

  if (!invite) {
    throw new Error('Convite não encontrado.');
  }

  if (invite.status !== 'PENDING') {
    throw new Error('Convite já foi processado.');
  }

  // Verificar se o usuário já está em um time
  if (invite.user.teamId) {
    throw new Error('Usuário já está em um time.');
  }

  // Aceitar o convite
  await prisma.teamInvite.update({
    where: { id: inviteId },
    data: { status: 'ACCEPTED' },
  });

  // Adicionar usuário ao time
  await prisma.user.update({
    where: { id: invite.userId },
    data: { teamId: invite.teamId },
  });

  // Rejeitar todas as outras solicitações pendentes do usuário
  await prisma.teamRequest.updateMany({
    where: {
      userId: invite.userId,
      status: 'PENDING',
    },
    data: { status: 'REJECTED' },
  });

  // Rejeitar todos os outros convites pendentes do usuário
  await prisma.teamInvite.updateMany({
    where: {
      userId: invite.userId,
      status: 'PENDING',
      id: { not: inviteId },
    },
    data: { status: 'DECLINED' },
  });

  return invite;
}

export async function declineTeamInvite(inviteId: string) {
  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) {
    throw new Error('Convite não encontrado.');
  }

  if (invite.status !== 'PENDING') {
    throw new Error('Convite já foi processado.');
  }

  return await prisma.teamInvite.update({
    where: { id: inviteId },
    data: { status: 'DECLINED' },
  });
}

export async function cancelTeamRequest(requestId: string) {
  const request = await prisma.teamRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('Solicitação não encontrada.');
  }

  if (request.status !== 'PENDING') {
    throw new Error('Solicitação já foi processada.');
  }

  return await prisma.teamRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });
}

// Função para verificar se um usuário tem permissão para gerenciar convites e solicitações
export async function canManageTeamRequests(userId: string, teamId: string): Promise<boolean> {
  // Verificar se o usuário é o criador do time
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { createdBy: true },
  });

  if (!team) {
    return false;
  }

  if (team.createdBy === userId) {
    return true;
  }

  // Verificar se o usuário é membro do time e tem cargos de liderança
  const userTeamRoles = await prisma.userTeamRole.findMany({
    where: {
      userId,
      teamRole: {
        teamId,
        isActive: true,
      },
    },
    include: {
      teamRole: {
        select: {
          name: true,
        },
      },
    },
  });

  // Lista de cargos que podem gerenciar convites e solicitações
  const managementRoles = [
    'Tech Lead',
    'Design Lead', 
    'Marketing Manager',
    'Team Lead',
    'Manager',
    'Lead',
    'Coordinator',
    'Supervisor',
  ];

  // Verificar se o usuário tem algum cargo de liderança
  return userTeamRoles.some(userRole => 
    managementRoles.some(role => 
      userRole.teamRole.name.toLowerCase().includes(role.toLowerCase())
    )
  );
} 