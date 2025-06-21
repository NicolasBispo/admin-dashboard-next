'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Search, Calendar, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  userId: string;
  teamId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

const actionColors = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  INVITE_SENT: 'bg-yellow-100 text-yellow-800',
  INVITE_ACCEPTED: 'bg-green-100 text-green-800',
  INVITE_DECLINED: 'bg-red-100 text-red-800',
  REQUEST_SENT: 'bg-blue-100 text-blue-800',
  REQUEST_APPROVED: 'bg-green-100 text-green-800',
  REQUEST_REJECTED: 'bg-red-100 text-red-800',
  ROLE_CHANGED: 'bg-orange-100 text-orange-800',
  STATUS_CHANGED: 'bg-indigo-100 text-indigo-800',
};

const actionLabels = {
  CREATE: 'Criar',
  UPDATE: 'Atualizar',
  DELETE: 'Excluir',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  INVITE_SENT: 'Convite Enviado',
  INVITE_ACCEPTED: 'Convite Aceito',
  INVITE_DECLINED: 'Convite Recusado',
  REQUEST_SENT: 'Solicitação Enviada',
  REQUEST_APPROVED: 'Solicitação Aprovada',
  REQUEST_REJECTED: 'Solicitação Rejeitada',
  ROLE_CHANGED: 'Role Alterada',
  STATUS_CHANGED: 'Status Alterado',
};

export default function AuditLogViewer() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  const { data: auditData, isLoading, error, refetch } = useQuery({
    queryKey: ['auditLogs', pagination.page, pagination.limit, filters],
    queryFn: async (): Promise<AuditLogsResponse> => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/audit-logs?${params}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar logs de auditoria');
      }

      return response.json();
    },
    enabled: !!user && ['SUPER_ADMIN', 'ADMIN'].includes(user.role),
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });

  const auditLogs = auditData?.logs || [];
  const total = auditData?.total || 0;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetadataDisplay = (metadata?: string) => {
    if (!metadata) return null;
    
    try {
      const parsed = JSON.parse(metadata);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return metadata;
    }
  };

  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <span>Logs de Auditoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Acesso negado. Apenas administradores podem visualizar logs de auditoria.</p>
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
            <History className="h-5 w-5" />
            <span>Logs de Auditoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <span>Logs de Auditoria</span>
        </CardTitle>
        <CardDescription>
          Histórico de ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="action-filter">Ação</Label>
            <Select
              value={filters.action}
              onValueChange={(value) => handleFilterChange('action', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-filter">Tipo de Entidade</Label>
            <Select
              value={filters.entityType}
              onValueChange={(value) => handleFilterChange('entityType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="team">Time</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
                <SelectItem value="request">Solicitação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Buscar por descrição..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button size="sm" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Limite por página</Label>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => setPagination(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Logs */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {formatDate(log.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action as keyof typeof actionColors]}>
                          {actionLabels[log.action as keyof typeof actionLabels] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{log.description}</div>
                        {log.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            {getMetadataDisplay(log.metadata)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.team ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{log.team.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500">
                          {log.ipAddress && (
                            <div>IP: {log.ipAddress}</div>
                          )}
                          {log.entityId && (
                            <div>ID: {log.entityId}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {total > pagination.limit && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, total)} de {total} registros
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page * pagination.limit >= total}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 