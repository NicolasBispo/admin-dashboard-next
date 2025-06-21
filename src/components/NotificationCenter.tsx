'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Clock, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'invite' | 'request' | 'system';
  title: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  data?: {
    id: string;
    team: { name: string };
    user?: { name: string };
    createdAt: string;
  };
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id, user?.role],
    queryFn: async (): Promise<Notification[]> => {
      // Buscar convites pendentes
      const invitesResponse = await fetch('/api/teams/invites');
      const invitesData = await invitesResponse.json();
      
      // Buscar solicitações pendentes (se for admin)
      let requestsData = { requests: [] };
      if (['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '')) {
        const requestsResponse = await fetch('/api/teams/requests');
        requestsData = await requestsResponse.json();
      }

      const notificationsList: Notification[] = [];

      // Converter convites em notificações
      invitesData.invites?.forEach((invite: { id: string; team: { name: string }; status: string; createdAt: string }) => {
        if (invite.status === 'PENDING') {
          notificationsList.push({
            id: `invite-${invite.id}`,
            type: 'invite',
            title: 'Convite para Time',
            message: `Você foi convidado para participar do time "${invite.team.name}"`,
            status: 'pending',
            createdAt: invite.createdAt,
            data: invite,
          });
        }
      });

      // Converter solicitações em notificações
      requestsData.requests?.forEach((request: { id: string; team: { name: string }; user: { name: string }; status: string; createdAt: string }) => {
        if (request.status === 'PENDING') {
          notificationsList.push({
            id: `request-${request.id}`,
            type: 'request',
            title: 'Solicitação de Participação',
            message: `${request.user.name} solicitou participar do time "${request.team.name}"`,
            status: 'pending',
            createdAt: request.createdAt,
            data: request,
          });
        }
      });

      // Ordenar por data de criação (mais recentes primeiro)
      notificationsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return notificationsList;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });

  const handleInviteAction = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/teams/invites/${inviteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar convite');
      }

      toast.success(`Convite ${action === 'accept' ? 'aceito' : 'recusado'} com sucesso!`);
      refetch();
    } catch {
      toast.error('Erro ao processar convite');
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/teams/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar solicitação');
      }

      toast.success(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      refetch();
    } catch {
      toast.error('Erro ao processar solicitação');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const displayedNotifications = showAll ? notifications : pendingNotifications.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notificações</span>
          {pendingNotifications.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingNotifications.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {pendingNotifications.length} notificação{pendingNotifications.length !== 1 ? 'es' : ''} pendente{pendingNotifications.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {notification.type === 'invite' && <UserPlus className="h-4 w-4 text-blue-500" />}
                      {notification.type === 'request' && <Users className="h-4 w-4 text-green-500" />}
                      {notification.type === 'system' && <Bell className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {notification.status === 'pending' && (
                    <div className="flex gap-1 ml-2">
                      {notification.type === 'invite' && notification.data && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleInviteAction(notification.data!.id, 'accept')}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleInviteAction(notification.data!.id, 'decline')}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </>
                      )}
                      {notification.type === 'request' && notification.data && ['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRequestAction(notification.data!.id, 'approve')}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRequestAction(notification.data!.id, 'reject')}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {notifications.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Mostrar menos' : `Ver todas (${notifications.length})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 