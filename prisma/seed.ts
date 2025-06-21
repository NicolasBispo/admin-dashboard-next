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

  // Criar usuários de exemplo
  const user1Password = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.create({
    data: {
      email: 'joao@example.com',
      password: user1Password,
      name: 'João Silva',
      role: 'USER',
      teamId: team1.id,
    },
  });

  const user2Password = await bcrypt.hash('user123', 10);
  const user2 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      password: user2Password,
      name: 'Maria Santos',
      role: 'USER',
      teamId: team2.id,
    },
  });

  const user3Password = await bcrypt.hash('user123', 10);
  const user3 = await prisma.user.create({
    data: {
      email: 'pedro@example.com',
      password: user3Password,
      name: 'Pedro Costa',
      role: 'USER',
      // Este usuário não está em nenhum time
    },
  });

  // Criar alguns convites de exemplo
  await prisma.teamInvite.create({
    data: {
      teamId: team1.id,
      userId: user3.id,
      invitedBy: admin.id,
      message: 'Gostaríamos que você se juntasse ao nosso time de desenvolvimento!',
    },
  });

  // Criar algumas solicitações de exemplo
  await prisma.teamRequest.create({
    data: {
      teamId: team2.id,
      userId: user3.id,
      message: 'Tenho experiência em design e gostaria de contribuir com o time!',
    },
  });

  console.log('✅ Seed concluído!');
  console.log('');
  console.log('👥 Usuários criados:');
  console.log(`- Admin: admin@example.com / admin123`);
  console.log(`- João: joao@example.com / user123 (Time de Desenvolvimento)`);
  console.log(`- Maria: maria@example.com / user123 (Time de Design)`);
  console.log(`- Pedro: pedro@example.com / user123 (Sem time - tem convite e solicitação pendentes)`);
  console.log('');
  console.log('🏢 Times criados:');
  console.log(`- Time de Desenvolvimento (criado por Admin)`);
  console.log(`- Time de Design (criado por Admin)`);
  console.log(`- Time de Marketing (criado por Admin)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 