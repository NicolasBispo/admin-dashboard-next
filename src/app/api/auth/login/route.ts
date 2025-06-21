import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const { token, expiresAt } = await login(email, password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    return response;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
} 