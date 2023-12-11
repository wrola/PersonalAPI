import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkill1702331916073 implements MigrationInterface {
  name = 'AddSkill1702331916073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "tags" jsonb NOT NULL, "webhook" character varying, "schema" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "skills"`);
  }
}
