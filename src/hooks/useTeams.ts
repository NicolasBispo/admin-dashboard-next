import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    users: number;
  };
}

interface TeamRequest {
  id: string;
  team: {
    id: string;
    name: string;
    description?: string;
  };
  message?: string;
  createdAt: string;
}

interface TeamInvite {
  id: string;
  team: {
    id: string;
    name: string;
    description?: string;
  };
  sender: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  createdAt: string;
}

// Fetch teams
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async (): Promise<{ teams: Team[] }> => {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return response.json();
    },
  });
};

// Fetch user requests
export const useUserRequests = () => {
  return useQuery({
    queryKey: ['userRequests'],
    queryFn: async (): Promise<{ requests: TeamRequest[] }> => {
      const response = await fetch('/api/teams/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch user requests');
      }
      return response.json();
    },
  });
};

// Fetch user invites
export const useUserInvites = () => {
  return useQuery({
    queryKey: ['userInvites'],
    queryFn: async (): Promise<{ invites: TeamInvite[] }> => {
      const response = await fetch('/api/teams/invites');
      if (!response.ok) {
        throw new Error('Failed to fetch user invites');
      }
      return response.json();
    },
  });
};

// Create team request
export const useCreateTeamRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teamId, message }: { teamId: string; message?: string }) => {
      const response = await fetch('/api/teams/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, message }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRequests'] });
      toast.success('Solicitação enviada com sucesso! Aguarde a aprovação do líder do time.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Create team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(`Time "${data.team.name}" criado com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Accept invite
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await fetch(`/api/teams/invites/${inviteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invite');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInvites'] });
      toast.success('Convite aceito com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Decline invite
export const useDeclineInvite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await fetch(`/api/teams/invites/${inviteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decline invite');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInvites'] });
      toast.success('Convite recusado.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Cancel request
export const useCancelRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/teams/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRequests'] });
      toast.success('Solicitação cancelada.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}; 