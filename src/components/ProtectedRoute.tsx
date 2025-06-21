'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireTeam?: boolean;
}

export default function ProtectedRoute({ children, requiredRoles, requireTeam = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Se requireTeam é true e o usuário não tem time, redirecionar para signup
    // Exceto se for SUPER_ADMIN
    if (!loading && user && requireTeam && !user.teamId && user.role !== 'SUPER_ADMIN') {
      router.push('/signup');
    }
  }, [user, loading, router, requireTeam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se requireTeam é true e o usuário não tem time, não renderizar nada
  // Exceto se for SUPER_ADMIN
  if (requireTeam && !user.teamId && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Access denied</div>
      </div>
    );
  }

  return <>{children}</>;
} 