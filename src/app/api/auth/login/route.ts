import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/services/authService';
import { authRateLimiter, getClientIdentifier } from '@/lib/rateLimit';
import { logUserLogin } from '@/services/auditService';

export async function POST(req: NextRequest) {
  try {
    // Verificar rate limit
    const clientId = getClientIdentifier(req);
    const rateLimitResult = authRateLimiter.isAllowed(clientId);
    
    // if (!rateLimitResult.allowed) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Too many login attempts. Please try again later.',
    //       resetTime: rateLimitResult.resetTime 
    //     },
    //     { status: 429 }
    //   );
    // }

    const { email, password } = await req.json();
    const { token, expiresAt, user } = await login(email, password);
    
    // Log de auditoria
    await logUserLogin(user.id, clientId, req.headers.get('user-agent') || undefined);
    
    const response = NextResponse.json({ ok: true });
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    
    // Adicionar headers de rate limit
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    
    return response;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
} 