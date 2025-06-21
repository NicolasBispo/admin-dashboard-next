'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['teamRequests', teamId],
    queryFn: async (): Promise<TeamRequest[]> => {
      const response = await fetch(`/api/teams/${teamId}/requests`);
      if (response.ok) {
        const data = await response.json();
        return data.requests;
      }
      throw new Error('Failed to fetch requests');
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });

  const requestActionMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/teams/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamRequests', teamId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await requestActionMutation.mutateAsync({ requestId, action });
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      toast.success(`Request ${actionText} successfully!`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Requests
            <Badge variant="secondary">0</Badge>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Requests
            <Badge variant="secondary">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Requests
            <Badge variant="secondary">0</Badge>
          </CardTitle>
          <CardDescription>
            No pending requests for this team
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pending Requests
          <Badge variant="secondary">{requests.length}</Badge>
        </CardTitle>
        <CardDescription>
          Manage team join requests
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    Requested on: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => handleRequestAction(request.id, 'approve')}
                    disabled={requestActionMutation.isPending}
                  >
                    {requestActionMutation.isPending ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    disabled={requestActionMutation.isPending}
                  >
                    {requestActionMutation.isPending ? 'Processing...' : 'Reject'}
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