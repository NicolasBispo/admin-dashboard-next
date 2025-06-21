# Configuração do Banco de Dados

## Estrutura Atual

O projeto usa **SQLite** como banco de dados, que é um arquivo local chamado `database.db` na raiz do projeto.

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

### 2. Configuração do Banco

O arquivo `.env` deve conter:

```env
DATABASE_URL="file:./database.db"
SEED_BEARER_TOKEN="your-secret-seed-token-here"
```

### 3. Primeira Execução

Para criar o banco e executar as migrações:

```bash
# Gerar o cliente Prisma
pnpm prisma generate

# Executar migrações
pnpm prisma migrate deploy

# (Opcional) Popular com dados de exemplo
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer your-secret-seed-token-here"
```

## Em Produção

### Vercel/Netlify

1. Configure a variável `DATABASE_URL` no painel de controle
2. Use um caminho absoluto ou relativo que funcione no ambiente de produção
3. Para Vercel, você pode usar: `DATABASE_URL="file:/tmp/database.db"`

### Docker

Se estiver usando Docker, certifique-se de que o volume do banco seja persistente:

```dockerfile
VOLUME /app/database.db
```

## Troubleshooting

### Erro: "Unable to open the database file"

1. Verifique se o `DATABASE_URL` está correto
2. Certifique-se de que o diretório tem permissões de escrita
3. Em produção, use um caminho que o processo possa acessar

### Erro: "Database is locked"

Isso pode acontecer se múltiplas instâncias tentarem acessar o SQLite simultaneamente. Em produção com múltiplas instâncias, considere usar PostgreSQL. 