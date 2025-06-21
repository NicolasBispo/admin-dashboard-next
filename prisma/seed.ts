import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes na ordem correta (respeitando foreign keys)
  await prisma.session.deleteMany();
  await prisma.userTeamRole.deleteMany();
  await prisma.teamRequest.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamRole.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Dados limpos');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
    },
  });

  // Criar alguns times de exemplo
  const team1 = await prisma.team.create({
    data: {
      name: 'Time de Desenvolvimento',
      description: 'Time responsável pelo desenvolvimento de software',
      createdBy: admin.id,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Time de Design',
      description: 'Time responsável pelo design e UX',
      createdBy: admin.id,
    },
  });

  const team3 = await prisma.team.create({
    data: {
      name: 'Time de Marketing',
      description: 'Time responsável pelo marketing e vendas',
      createdBy: admin.id,
    },
  });

  // Criar cargos para o Time de Desenvolvimento
  const devTeamRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Tech Lead',
        color: '#3B82F6',
        teamId: team1.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Desenvolvedor Full Stack',
        color: '#10B981',
        teamId: team1.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Desenvolvedor Frontend',
        color: '#F59E0B',
        teamId: team1.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Desenvolvedor Backend',
        color: '#8B5CF6',
        teamId: team1.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'QA Engineer',
        color: '#EF4444',
        teamId: team1.id,
      },
    }),
  ]);

  // Criar cargos para o Time de Design
  const designTeamRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Design Lead',
        color: '#EC4899',
        teamId: team2.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'UX Designer',
        color: '#06B6D4',
        teamId: team2.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'UI Designer',
        color: '#84CC16',
        teamId: team2.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Product Designer',
        color: '#F97316',
        teamId: team2.id,
      },
    }),
  ]);

  // Criar cargos para o Time de Marketing
  const marketingTeamRoles = await Promise.all([
    prisma.teamRole.create({
      data: {
        name: 'Marketing Manager',
        color: '#6366F1',
        teamId: team3.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Digital Marketing',
        color: '#14B8A6',
        teamId: team3.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'Content Creator',
        color: '#F43F5E',
        teamId: team3.id,
      },
    }),
    prisma.teamRole.create({
      data: {
        name: 'SEO Specialist',
        color: '#A855F7',
        teamId: team3.id,
      },
    }),
  ]);

  // Criar usuários para o Time de Desenvolvimento
  const devUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'techlead@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Carlos Tech Lead',
        role: 'MANAGER',
        teamId: team1.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'fullstack@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Ana Full Stack',
        role: 'USER',
        teamId: team1.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'frontend@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'João Frontend',
        role: 'USER',
        teamId: team1.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'backend@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Maria Backend',
        role: 'USER',
        teamId: team1.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'qa@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Pedro QA',
        role: 'USER',
        teamId: team1.id,
      },
    }),
  ]);

  // Criar usuários para o Time de Design
  const designUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'designlead@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Sofia Design Lead',
        role: 'MANAGER',
        teamId: team2.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'uxdesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Lucas UX Designer',
        role: 'USER',
        teamId: team2.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'uidesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Camila UI Designer',
        role: 'USER',
        teamId: team2.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'productdesigner@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Rafael Product Designer',
        role: 'USER',
        teamId: team2.id,
      },
    }),
  ]);

  // Criar usuários para o Time de Marketing
  const marketingUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'marketingmanager@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Isabela Marketing Manager',
        role: 'MANAGER',
        teamId: team3.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'digitalmarketing@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Gabriel Digital Marketing',
        role: 'USER',
        teamId: team3.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'contentcreator@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Juliana Content Creator',
        role: 'USER',
        teamId: team3.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'seospecialist@example.com',
        password: await bcrypt.hash('user123', 10),
        name: 'Diego SEO Specialist',
        role: 'USER',
        teamId: team3.id,
      },
    }),
  ]);

  // Atribuir cargos aos usuários do Time de Desenvolvimento
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[0].id,
        teamRoleId: devTeamRoles[0].id, // Tech Lead
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[1].id,
        teamRoleId: devTeamRoles[1].id, // Full Stack
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[2].id,
        teamRoleId: devTeamRoles[2].id, // Frontend
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[3].id,
        teamRoleId: devTeamRoles[3].id, // Backend
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: devUsers[4].id,
        teamRoleId: devTeamRoles[4].id, // QA
      },
    }),
  ]);

  // Atribuir cargos aos usuários do Time de Design
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[0].id,
        teamRoleId: designTeamRoles[0].id, // Design Lead
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[1].id,
        teamRoleId: designTeamRoles[1].id, // UX Designer
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[2].id,
        teamRoleId: designTeamRoles[2].id, // UI Designer
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: designUsers[3].id,
        teamRoleId: designTeamRoles[3].id, // Product Designer
      },
    }),
  ]);

  // Atribuir cargos aos usuários do Time de Marketing
  await Promise.all([
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[0].id,
        teamRoleId: marketingTeamRoles[0].id, // Marketing Manager
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[1].id,
        teamRoleId: marketingTeamRoles[1].id, // Digital Marketing
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[2].id,
        teamRoleId: marketingTeamRoles[2].id, // Content Creator
      },
    }),
    prisma.userTeamRole.create({
      data: {
        userId: marketingUsers[3].id,
        teamRoleId: marketingTeamRoles[3].id, // SEO Specialist
      },
    }),
  ]);

  // Criar um usuário sem time para testar convites e solicitações
  const userWithoutTeam = await prisma.user.create({
    data: {
      email: 'semtime@example.com',
      password: await bcrypt.hash('user123', 10),
      name: 'Usuário Sem Time',
      role: 'USER',
    },
  });

  // Criar alguns convites de exemplo
  await prisma.teamInvite.create({
    data: {
      teamId: team1.id,
      userId: userWithoutTeam.id,
      invitedBy: admin.id,
      message: 'Gostaríamos que você se juntasse ao nosso time de desenvolvimento!',
    },
  });

  // Criar algumas solicitações de exemplo
  await prisma.teamRequest.create({
    data: {
      teamId: team2.id,
      userId: userWithoutTeam.id,
      message: 'Tenho experiência em design e gostaria de contribuir com o time!',
    },
  });

  console.log('✅ Seed concluído!');
  console.log('');
  console.log('👥 Usuários criados:');
  console.log(`- Admin: admin@example.com / admin123`);
  console.log('');
  console.log('🏢 Time de Desenvolvimento:');
  console.log(`- Tech Lead: techlead@example.com / user123`);
  console.log(`- Full Stack: fullstack@example.com / user123`);
  console.log(`- Frontend: frontend@example.com / user123`);
  console.log(`- Backend: backend@example.com / user123`);
  console.log(`- QA: qa@example.com / user123`);
  console.log('');
  console.log('🎨 Time de Design:');
  console.log(`- Design Lead: designlead@example.com / user123`);
  console.log(`- UX Designer: uxdesigner@example.com / user123`);
  console.log(`- UI Designer: uidesigner@example.com / user123`);
  console.log(`- Product Designer: productdesigner@example.com / user123`);
  console.log('');
  console.log('📢 Time de Marketing:');
  console.log(`- Marketing Manager: marketingmanager@example.com / user123`);
  console.log(`- Digital Marketing: digitalmarketing@example.com / user123`);
  console.log(`- Content Creator: contentcreator@example.com / user123`);
  console.log(`- SEO Specialist: seospecialist@example.com / user123`);
  console.log('');
  console.log('👤 Usuário sem time:');
  console.log(`- semtime@example.com / user123 (tem convite e solicitação pendentes)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 