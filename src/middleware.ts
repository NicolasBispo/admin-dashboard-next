import { NextRequest, NextResponse } from 'next/server';

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];

// Rotas que precisam de autenticação
const protectedRoutes = ['/dashboard', '/api/users', '/api/teams'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
    const sessionToken = request.cookies.get('session-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Para o middleware, apenas verificar se existe o token de sessão
    // A verificação detalhada do usuário será feita no cliente ou nas APIs
    // Isso evita problemas com Prisma no Edge Runtime
    
    // Lógica especial para a página raiz - deixar o cliente decidir
    if (pathname === '/') {
      return NextResponse.next();
    }

    // Para rotas protegidas, apenas verificar se tem token
    // O ProtectedRoute no cliente fará a verificação detalhada
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 