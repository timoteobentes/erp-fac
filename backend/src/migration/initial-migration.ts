import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1699000000000 implements MigrationInterface {
  name = 'InitialMigration1699000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de grupos de acesso
    await queryRunner.query(`
      CREATE TABLE "access_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "permissions" jsonb NOT NULL DEFAULT '{}',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_access_groups_name" UNIQUE ("name"),
        CONSTRAINT "PK_access_groups" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de usuários
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(100) NOT NULL,
        "name" character varying(100) NOT NULL,
        "password" character varying NOT NULL,
        "phone" character varying(20),
        "active" boolean NOT NULL DEFAULT true,
        "access_group_id" uuid,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de clientes
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "tradeName" character varying(200),
        "document" character varying(18) NOT NULL,
        "phone" character varying(20),
        "email" character varying(100),
        "zipCode" character varying(10),
        "street" character varying(200),
        "number" character varying(20),
        "complement" character varying(100),
        "neighborhood" character varying(100),
        "city" character varying(100),
        "state" character varying(2),
        "notes" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_clients_document" UNIQUE ("document"),
        CONSTRAINT "PK_clients" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de fornecedores
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "tradeName" character varying(200),
        "document" character varying(18) NOT NULL,
        "phone" character varying(20),
        "email" character varying(100),
        "contactPerson" character varying(100),
        "zipCode" character varying(10),
        "street" character varying(200),
        "number" character varying(20),
        "complement" character varying(100),
        "neighborhood" character varying(100),
        "city" character varying(100),
        "state" character varying(2),
        "notes" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_suppliers_document" UNIQUE ("document"),
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de funcionários
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "cpf" character varying(14) NOT NULL,
        "rg" character varying(20),
        "birthDate" date,
        "phone" character varying(20),
        "email" character varying(100),
        "position" character varying(100),
        "salary" decimal(10,2),
        "hireDate" date,
        "terminationDate" date,
        "zipCode" character varying(10),
        "street" character varying(200),
        "number" character varying(20),
        "complement" character varying(100),
        "neighborhood" character varying(100),
        "city" character varying(100),
        "state" character varying(2),
        "notes" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_employees_cpf" UNIQUE ("cpf"),
        CONSTRAINT "PK_employees" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de transportadoras
    await queryRunner.query(`
      CREATE TABLE "carriers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "tradeName" character varying(200),
        "document" character varying(18) NOT NULL,
        "phone" character varying(20),
        "email" character varying(100),
        "contactPerson" character varying(100),
        "vehiclePlate" character varying(20),
        "vehicleType" character varying(50),
        "zipCode" character varying(10),
        "street" character varying(200),
        "number" character varying(20),
        "complement" character varying(100),
        "neighborhood" character varying(100),
        "city" character varying(100),
        "state" character varying(2),
        "notes" text,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_carriers_document" UNIQUE ("document"),
        CONSTRAINT "PK_carriers" PRIMARY KEY ("id")
      )
    `);

    // Adicionar foreign key de usuários para grupos de acesso
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_access_group" 
      FOREIGN KEY ("access_group_id") 
      REFERENCES "access_groups"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);

    // Criar índices para melhor performance
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_access_group" ON "users" ("access_group_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_clients_document" ON "clients" ("document")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_clients_name" ON "clients" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suppliers_document" ON "suppliers" ("document")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_suppliers_name" ON "suppliers" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_employees_cpf" ON "employees" ("cpf")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_employees_name" ON "employees" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_carriers_document" ON "carriers" ("document")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_carriers_name" ON "carriers" ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX "IDX_carriers_name"`);
    await queryRunner.query(`DROP INDEX "IDX_carriers_document"`);
    await queryRunner.query(`DROP INDEX "IDX_employees_name"`);
    await queryRunner.query(`DROP INDEX "IDX_employees_cpf"`);
    await queryRunner.query(`DROP INDEX "IDX_suppliers_name"`);
    await queryRunner.query(`DROP INDEX "IDX_suppliers_document"`);
    await queryRunner.query(`DROP INDEX "IDX_clients_name"`);
    await queryRunner.query(`DROP INDEX "IDX_clients_document"`);
    await queryRunner.query(`DROP INDEX "IDX_users_access_group"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Remover foreign key
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_access_group"`,
    );

    // Remover tabelas
    await queryRunner.query(`DROP TABLE "carriers"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "access_groups"`);
  }
}
