'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, LogOut, User, Building2 } from 'lucide-react';
import AddUserForm from '@/components/AddUserForm';
import PendingRequests from '@/components/PendingRequests';
import UserList from '@/components/UserList';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [showUserList, setShowUserList] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleAddUserSuccess = () => {
    // Here you can add logic to update the user list
    // For example, reload data or show a notification
    console.log('User created successfully!');
  };

  const handleShowUsers = () => {
    setShowUserList(!showUserList);
  };

  return (
    <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* User List Section */}
            {showUserList && user?.teamId && (
              <div className="mb-6">
                <UserList teamId={user.teamId} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Card of Statistics */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total of Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user?.team?._count?.users || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active users in the team
                  </p>
                </CardContent>
              </Card>

              {/* Card of Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your team's users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleShowUsers}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {showUserList ? 'Hide Users' : 'View Users'}
                  </Button>
                  {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                    <AddUserForm onSuccess={handleAddUserSuccess} />
                  )}
                </CardContent>
              </Card>

              {/* Team Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Information</CardTitle>
                  <CardDescription>
                    Details about your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Time:</span>
                      <div className="text-sm text-muted-foreground">
                        {user?.team ? (
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>{user.team.name}</span>
                          </div>
                        ) : (
                          'No team'
                        )}
                      </div>
                    </div>
                    {user?.team && (
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <p className="text-sm text-muted-foreground">
                          {user.team.description || 'No description'}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">Your Role:</span>
                      <p className="text-sm text-muted-foreground">
                        {user?.role}
                      </p>
                    </div>
                    {user?.team && (
                      <div>
                        <span className="text-sm font-medium">Created by:</span>
                        <p className="text-sm text-muted-foreground">
                          {user.team.creator.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Requests Section - only for team creators */}
            {user?.teamId && (
              <div className="mt-6">
                <PendingRequests teamId={user.teamId} />
              </div>
            )}

            {/* Created Teams Section - only for users who created teams */}
            {user?.createdTeams && user.createdTeams.length > 0 && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Times Created by You</CardTitle>
                    <CardDescription>
                      Times you created and manage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.createdTeams.map((team) => (
                        <div key={team.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            <h3 className="font-medium">{team.name}</h3>
                          </div>
                          {team.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {team.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {team._count.users} members
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 