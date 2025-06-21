'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Verificar se o usuário tem um time
        // SUPER_ADMIN pode acessar dashboard mesmo sem time
        if (user.teamId || user.role === 'SUPER_ADMIN') {
          router.push('/dashboard');
        } else {
          // Usuário sem time deve ir para signup para selecionar/criar time
          router.push('/signup');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return null;
}
