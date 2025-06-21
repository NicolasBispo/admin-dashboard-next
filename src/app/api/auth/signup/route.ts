import { NextRequest, NextResponse } from 'next/server';
import { signup } from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required.' },
        { status: 400 }
      );
    }

    const user = await signup(email, password, name);

    return NextResponse.json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 