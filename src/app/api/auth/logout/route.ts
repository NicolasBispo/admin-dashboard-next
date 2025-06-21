import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/services/authService';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get('session-token')?.value;
  await logout(sessionToken || '');
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session-token', '', { httpOnly: true, expires: new Date(0), path: '/' });
  return response;
} 