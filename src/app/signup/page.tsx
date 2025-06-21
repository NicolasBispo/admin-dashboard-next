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

  const { signup, user, logout, login } = useAuth();
  const router = useRouter();

  // TanStack Query hooks - only enabled when user is authenticated and in team-selection step
  const { data: teamsData, isLoading: teamsLoading } = useTeams({
    enabled: step === 'team-selection' && !!user
  });
  const { data: requestsData } = useUserRequests({
    enabled: step === 'team-selection' && !!user
  });
  const { data: invitesData } = useUserInvites({
    enabled: step === 'team-selection' && !!user
  });
  
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
        // User is already in a team, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not in a team, go to team selection
        setStep('team-selection');
      }
    }
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, name);
      // Após o signup bem-sucedido, fazer login para criar a sessão
      await login(email, password);
      // O useEffect detectará o usuário e redirecionará para seleção de time
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam) {
      setError('Please select a team.');
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Team name is required.');
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInviteMutation.mutateAsync(inviteId);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineInviteMutation.mutateAsync(inviteId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequestMutation.mutateAsync(requestId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  };

  if (step === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Create your account to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
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
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Already have an account?</p>
              <a href="/login" className="text-blue-600 hover:underline">
                Sign in
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
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-600 mt-2">
            Now you need to join a team or create a new one.
          </p>
        </div>

        {/* Pending Invites */}
        {userInvites.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Pending Invites</CardTitle>
              <CardDescription>
                You have invites to join teams
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
                          Invite from: {invite.sender.name}
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
                          {acceptInviteMutation.isPending ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.id)}
                          disabled={declineInviteMutation.isPending}
                        >
                          {declineInviteMutation.isPending ? 'Declining...' : 'Decline'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Requests */}
        {userRequests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Pending Requests</CardTitle>
              <CardDescription>
                Your requests to join teams
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
                          Sent on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancelRequestMutation.isPending}
                      >
                        {cancelRequestMutation.isPending ? 'Canceling...' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Join a Team */}
          <Card>
            <CardHeader>
              <CardTitle>Join a Team</CardTitle>
              <CardDescription>
                Request to join an existing team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="team">Select Team</Label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                  disabled={teamsLoading}
                >
                  <option value="">Choose a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team._count.users} members)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us a bit about yourself and why you&apos;d like to join the team..."
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
                {createTeamRequestMutation.isPending ? 'Sending...' : 'Request to Join'}
              </Button>
            </CardContent>
          </Card>

          {/* Create New Team */}
          <Card className='h-fit'>
            <CardHeader>
              <CardTitle>Create New Team</CardTitle>
              <CardDescription>
                Create your own team and invite other members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
                <DialogTrigger asChild>
                  <Button className="w-full">Create Team</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>
                      Fill in your team&apos;s information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newTeamName">Team Name</Label>
                      <Input
                        id="newTeamName"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Your team name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newTeamDescription">Description (optional)</Label>
                      <Textarea
                        id="newTeamDescription"
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="Describe your team's purpose..."
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
                        {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateTeam(false)}
                        className="flex-1"
                      >
                        Cancel
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