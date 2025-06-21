import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Function to validate bearer token
function validateBearerToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = process.env.SEED_BEARER_TOKEN;
  
  return token === expectedToken;
}

// Seed function (copied from prisma/seed.ts)
async function runSeed() {
  console.log('🌱 Starting seed...');

  // Clear existing data in the correct order (respecting foreign keys)
  await prisma.session.deleteMany();
  await prisma.userTeamRole.deleteMany();
  await prisma.teamRequest.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamRole.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Data cleared');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'SUPER_ADMIN',
    },
  });

  // Create some example teams
  const devTeam = await prisma.team.create({
    data: {
      name: 'Development Team',
      description: 'Team responsible for software development',
      createdBy: admin.id,
    },
  });

  const designTeam = await prisma.team.create({
    data: {
      name: 'Design Team',
      description: 'Team responsible for design and UX',
      createdBy: admin.id,
    },
  });

  const marketingTeam = await prisma.team.create({
    data: {
      name: 'Marketing Team',
      description: 'Team responsible for marketing and sales',
      createdBy: admin.id,
    },
  });

  // Create roles for Development Team
  const devRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Tech Lead',
        color: '#3B82F6',
        teamId: devTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Full Stack Developer',
        color: '#10B981',
        teamId: devTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Frontend Developer',
        color: '#F59E0B',
        teamId: devTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Backend Developer',
        color: '#8B5CF6',
        teamId: devTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'QA Engineer',
        color: '#EF4444',
        teamId: devTeam.id,
      },
    }),
  ]);

  // Create roles for Design Team
  const designRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Design Lead',
        color: '#3B82F6',
        teamId: designTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'UX Designer',
        color: '#10B981',
        teamId: designTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'UI Designer',
        color: '#F59E0B',
        teamId: designTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Product Designer',
        color: '#8B5CF6',
        teamId: designTeam.id,
      },
    }),
  ]);

  // Create roles for Marketing Team
  const marketingRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Marketing Manager',
        color: '#3B82F6',
        teamId: marketingTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Digital Marketing',
        color: '#10B981',
        teamId: marketingTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Content Creator',
        color: '#F59E0B',
        teamId: marketingTeam.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'SEO Specialist',
        color: '#8B5CF6',
        teamId: marketingTeam.id,
      },
    }),
  ]);

  // Create users for Development Team
  const devUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'techlead@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Tech Lead',
        role: 'MANAGER',
        teamId: devTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'fullstack@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Full Stack Developer',
        role: 'USER',
        teamId: devTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'frontend@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Frontend Developer',
        role: 'USER',
        teamId: devTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'backend@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Backend Developer',
        role: 'USER',
        teamId: devTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'qa@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'QA Engineer',
        role: 'USER',
        teamId: devTeam.id,
      },
    }),
  ]);

  // Create users for Design Team
  const designUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'designlead@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Design Lead',
        role: 'MANAGER',
        teamId: designTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'uxdesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'UX Designer',
        role: 'USER',
        teamId: designTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'uidesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'UI Designer',
        role: 'USER',
        teamId: designTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'productdesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Product Designer',
        role: 'USER',
        teamId: designTeam.id,
      },
    }),
  ]);

  // Create users for Marketing Team
  const marketingUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'marketingmanager@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Marketing Manager',
        role: 'MANAGER',
        teamId: marketingTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'digitalmarketing@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Digital Marketing',
        role: 'USER',
        teamId: marketingTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'contentcreator@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Content Creator',
        role: 'USER',
        teamId: marketingTeam.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seospecialist@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'SEO Specialist',
        role: 'USER',
        teamId: marketingTeam.id,
      },
    }),
  ]);

  // Assign roles to Development Team users
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[0].id,
        teamRoleId: devRoles[0].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[1].id,
        teamRoleId: devRoles[1].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[2].id,
        teamRoleId: devRoles[2].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[3].id,
        teamRoleId: devRoles[3].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[4].id,
        teamRoleId: devRoles[4].id,
      },
    }),
  ]);

  // Assign roles to Design Team users
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[0].id,
        teamRoleId: designRoles[0].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[1].id,
        teamRoleId: designRoles[1].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[2].id,
        teamRoleId: designRoles[2].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[3].id,
        teamRoleId: designRoles[3].id,
      },
    }),
  ]);

  // Assign roles to Marketing Team users
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[0].id,
        teamRoleId: marketingRoles[0].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[1].id,
        teamRoleId: marketingRoles[1].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[2].id,
        teamRoleId: marketingRoles[2].id,
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[3].id,
        teamRoleId: marketingRoles[3].id,
      },
    }),
  ]);

  // Create a user without a team to test invites and requests
  const userWithoutTeam = await prisma.user.create({
    data: {
      email: 'semtime@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'User Without Team',
      role: 'USER',
    },
  });

  // Create some example invites
  await prisma.teamInvite.create({
    data: {
      teamId: devTeam.id,
      userId: userWithoutTeam.id,
      invitedBy: devUsers[0].id,
      message: 'We would like you to join our development team!',
    },
  });

  // Create some example requests
  await prisma.teamRequest.create({
    data: {
      teamId: designTeam.id,
      userId: userWithoutTeam.id,
      message: 'I have experience in design and would like to contribute to the team!',
    },
  });

  return {
    success: true,
    message: 'Seed completed successfully',
    usersCreated: {
      admin: 'admin@example.com / admin123 (Super Admin)',
      devTeam: devUsers.map((user, index) => `${user.email} / user123 (${devRoles[index].name})`),
      designTeam: designUsers.map((user, index) => `${user.email} / user123 (${designRoles[index].name})`),
      marketingTeam: marketingUsers.map((user, index) => `${user.email} / user123 (${marketingRoles[index].name})`),
      userWithoutTeam: 'semtime@example.com / user123 (has pending invite and request)'
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    // Validate bearer token
    if (!validateBearerToken(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing bearer token.' },
        { status: 401 }
      );
    }

    // Check if SEED_BEARER_TOKEN is configured
    if (!process.env.SEED_BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'SEED_BEARER_TOKEN not configured in environment variables.' },
        { status: 500 }
      );
    }

    // Run the seed
    const result = await runSeed();

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error running seed:', error);
    return NextResponse.json(
      { error: 'Internal server error while running seed.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Also allow GET method for convenience
export async function GET(req: NextRequest) {
  return POST(req);
} 