'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  useTeams,
  useUserRequests,
  useUserInvites,
  useCreateTeamRequest,
  useCreateTeam,
  useAcceptInvite,
  useDeclineInvite,
  useCancelRequest,
} from '@/hooks/useTeams';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'signup' | 'team-selection'>('signup');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamMessage, setTeamMessage] = useState('');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  const { signup, user } = useAuth();
  const router = useRouter();

  // TanStack Query hooks
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: requestsData } = useUserRequests();
  const { data: invitesData } = useUserInvites();
  
  const createTeamRequestMutation = useCreateTeamRequest();
  const createTeamMutation = useCreateTeam();
  const acceptInviteMutation = useAcceptInvite();
  const declineInviteMutation = useDeclineInvite();
  const cancelRequestMutation = useCancelRequest();

  const teams = teamsData?.teams || [];
  const userRequests = requestsData?.requests || [];
  const userInvites = invitesData?.invites || [];

  useEffect(() => {
    if (user) {
      if (user.teamId) {
        // Usuário já está em um time, redirecionar para dashboard
        router.push('/dashboard');
      } else {
        // Usuário não está em um time, ir para seleção de time
        setStep('team-selection');
      }
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
      // O useEffect vai detectar o usuário e redirecionar para seleção de time
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam) {
      setError('Selecione um time.');
      return;
    }

    setError('');

    try {
      await createTeamRequestMutation.mutateAsync({
        teamId: selectedTeam,
        message: teamMessage,
      });
      
      setSelectedTeam('');
      setTeamMessage('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Nome do time é obrigatório.');
      return;
    }

    setError('');

    try {
      await createTeamMutation.mutateAsync({
        name: newTeamName,
        description: newTeamDescription,
      });
      
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamDescription('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInviteMutation.mutateAsync(inviteId);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineInviteMutation.mutateAsync(inviteId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequestMutation.mutateAsync(requestId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Crie sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Já tem uma conta?</p>
              <a href="/login" className="text-blue-600 hover:underline">
                Faça login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo!</h1>
          <p className="text-gray-600 mt-2">
            Agora você precisa se juntar a um time ou criar um novo.
          </p>
        </div>

        {/* Convites Pendentes */}
        {userInvites.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Convites Pendentes</CardTitle>
              <CardDescription>
                Você tem convites para participar de times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userInvites.map((invite) => (
                  <div key={invite.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{invite.team.name}</h3>
                        <p className="text-sm text-gray-600">
                          Convite de: {invite.sender.name}
                        </p>
                        {invite.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            &ldquo;{invite.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.id)}
                          disabled={acceptInviteMutation.isPending}
                        >
                          {acceptInviteMutation.isPending ? 'Aceitando...' : 'Aceitar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.id)}
                          disabled={declineInviteMutation.isPending}
                        >
                          {declineInviteMutation.isPending ? 'Recusando...' : 'Recusar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solicitações Pendentes */}
        {userRequests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Solicitações Pendentes</CardTitle>
              <CardDescription>
                Suas solicitações para entrar em times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{request.team.name}</h3>
                        {request.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            &ldquo;{request.message}&rdquo;
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Enviada em: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancelRequestMutation.isPending}
                      >
                        {cancelRequestMutation.isPending ? 'Cancelando...' : 'Cancelar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Juntar-se a um Time */}
          <Card>
            <CardHeader>
              <CardTitle>Juntar-se a um Time</CardTitle>
              <CardDescription>
                Solicite entrada em um time existente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="team">Selecionar Time</Label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                  disabled={teamsLoading}
                >
                  <option value="">Escolha um time...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team._count.users} membros)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="Conte um pouco sobre você e por que gostaria de entrar no time..."
                  value={teamMessage}
                  onChange={(e) => setTeamMessage(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleJoinTeam}
                disabled={!selectedTeam || createTeamRequestMutation.isPending}
                className="w-full"
              >
                {createTeamRequestMutation.isPending ? 'Enviando...' : 'Solicitar Entrada'}
              </Button>
            </CardContent>
          </Card>

          {/* Criar Novo Time */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Time</CardTitle>
              <CardDescription>
                Crie seu próprio time e convide outros membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
                <DialogTrigger asChild>
                  <Button className="w-full">Criar Time</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Time</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do seu time
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newTeamName">Nome do Time</Label>
                      <Input
                        id="newTeamName"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Nome do seu time"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newTeamDescription">Descrição (opcional)</Label>
                      <Textarea
                        id="newTeamDescription"
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="Descreva o propósito do seu time..."
                        rows={3}
                      />
                    </div>
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateTeam}
                        disabled={!newTeamName.trim() || createTeamMutation.isPending}
                        className="flex-1"
                      >
                        {createTeamMutation.isPending ? 'Criando...' : 'Criar Time'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateTeam(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 