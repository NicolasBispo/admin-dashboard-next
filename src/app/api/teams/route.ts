import { NextRequest, NextResponse } from 'next/server';
import { getTeams, createTeam } from '@/services/teamService';
import { getSessionUser } from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    console.log('token', token);
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 401 }
      );
    }

    const teams = await getTeams();
    return NextResponse.json({ teams });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session-token')?.value;
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required.' },
        { status: 400 }
      );
    }

    const team = await createTeam({
      name,
      description,
      createdBy: user.id,
    });

    return NextResponse.json({ team });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 