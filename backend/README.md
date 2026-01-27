# ERP-FAC - Sistema de Gestão Empresarial

## 🚀 Configuração Inicial

### 1. Instalar dependências
```bash
npm install
npm install bcrypt
npm install @nestjs/mapped-types
npm install class-validator class-transformer
```

### 2. Configurar o banco de dados PostgreSQL

#### Opção A: Instalação local do PostgreSQL
```bash
# No terminal PostgreSQL (psql)
psql -U postgres
CREATE DATABASE "erp-fac";
\q
```

#### Opção B: Usar Docker
```bash
docker run --name postgres-erp \
  -e POSTGRES_PASSWORD=sua_senha \
  -e POSTGRES_DB=erp-fac \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configurar variáveis de ambiente
Edite o arquivo `.env` com suas credenciais do PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_aqui
DB_DATABASE=erp-fac
```

### 4. Executar as migrations
```bash
# Rodar todas as migrations
npm run migration:run
```

## 📋 Estrutura do Banco de Dados

### Tabelas Criadas:
1. **access_groups** - Grupos de acesso/permissões
2. **users** - Usuários do sistema
3. **clients** - Clientes
4. **suppliers** - Fornecedores
5. **employees** - Funcionários
6. **carriers** - Transportadoras

### Dados Iniciais (Seeds):
- ✅ 3 Grupos de acesso (Administrador, Vendedor, Comprador)
- ✅ 1 Usuário admin (email: admin@erp-fac.com, senha: admin123)
- ✅ 2 Clientes de exemplo
- ✅ 2 Fornecedores de exemplo
- ✅ 2 Funcionários de exemplo
- ✅ 2 Transportadoras de exemplo

## 🛠️ Comandos Úteis

### Migrations
```bash
# Criar uma nova migration
npm run typeorm migration:create src/migrations/NomeDaMigration

# Gerar migration automaticamente baseada nas entidades
npm run migration:generate src/migrations/NomeDaMigration

# Executar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Mostrar migrations executadas
npm run typeorm migration:show
```

### Desenvolvimento
```bash
# Rodar em modo desenvolvimento
npm run start:dev

# Rodar em modo produção
npm run build
npm run start:prod
```

## 📦 Estrutura de Pastas Recomendada

```
src/
├── config/
│   └── typeorm.config.ts
├── migrations/
│   ├── 1699000000000-InitialMigration.ts
│   └── 1699000000001-SeedInitialData.ts
├── modules/
│   ├── access-groups/
│   │   ├── entities/
│   │   │   └── access-group.entity.ts
│   │   ├── dto/
│   │   ├── access-groups.controller.ts
│   │   ├── access-groups.service.ts
│   │   └── access-groups.module.ts
│   ├── users/
│   ├── clients/
│   ├── suppliers/
│   ├── employees/
│   └── carriers/
├── app.module.ts
└── main.ts
```

## 🔧 Próximos Passos

### 1. Gerar módulos CRUD completos
```bash
nest g resource modules/clients --no-spec
nest g resource modules/suppliers --no-spec
nest g resource modules/employees --no-spec
nest g resource modules/carriers --no-spec
nest g resource modules/access-groups --no-spec
```

### 2. Implementar autenticação JWT
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### 3. Adicionar validação de CPF/CNPJ
```bash
npm install cpf-cnpj-validator
```

### 4. Implementar upload de arquivos
```bash
npm install @nestjs/platform-express multer
npm install -D @types/multer
```

## 🔐 Segurança

### Usuário Admin Padrão:
- **Email:** admin@erp-fac.com
- **Senha:** admin123
- ⚠️ **IMPORTANTE:** Altere esta senha em produção!

## 📝 Modificações no Banco

### Para adicionar novos campos:
1. Edite a entidade correspondente
2. Gere uma nova migration: `npm run migration:generate src/migrations/AddNovosCampos`
3. Execute a migration: `npm run migration:run`

### Para modificar campos existentes:
1. Altere a entidade
2. Gere migration automática ou crie manualmente
3. Execute a migration

### Exemplo de migration manual:
```typescript
// src/migrations/1699000000002-AddClientCategory.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientCategory1699000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN "category" character varying(50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients" 
      DROP COLUMN "category"
    `);
  }
}
```

## 🐛 Troubleshooting

### Erro de conexão com banco:
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `psql -U postgres -d erp-fac`

### Migration não executa:
- Verifique se o banco de dados existe
- Confirme que o arquivo de configuração está correto
- Limpe e reconstrua: `npm run migration:revert` e depois `npm run migration:run`

## 📚 Recursos Adicionais

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação TypeORM](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🤝 Contribuindo

Para adicionar novas funcionalidades:
1. Crie a entidade
2. Gere a migration
3. Crie o módulo CRUD
4. Implemente validações nos DTOs
5. Adicione testes

---

**Versão:** 1.0.0  
**Última atualização:** Novembro 2025