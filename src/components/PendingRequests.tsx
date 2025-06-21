'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TeamRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
  createdAt: string;
}

interface PendingRequestsProps {
  teamId: string;
}

export default function PendingRequests({ teamId }: PendingRequestsProps) {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, [teamId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/teams/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Recarregar solicitações
      await loadRequests();
      
      const actionText = action === 'approve' ? 'aprovada' : 'rejeitada';
      toast.success(`Solicitação ${actionText} com sucesso!`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Solicitações Pendentes
            <Badge variant="secondary">0</Badge>
          </CardTitle>
          <CardDescription>
            Não há solicitações pendentes para este time
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Solicitações Pendentes
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>
          Gerencie as solicitações de entrada no time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{request.user.name}</h3>
                  <p className="text-sm text-gray-600">{request.user.email}</p>
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-2">
                      &ldquo;{request.message}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Solicitado em: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleRequestAction(request.id, 'approve')}
                    disabled={loading}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    disabled={loading}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 