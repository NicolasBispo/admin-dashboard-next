import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/services/authService';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('session-token')?.value;
  const user = await getSessionUser(sessionToken);
  return NextResponse.json({ user });
} 