import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueSkill1702485539821 implements MigrationInterface {
  name = 'AddUniqueSkill1702485539821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_81f05095507fd84aa2769b4a52" ON "skills" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81f05095507fd84aa2769b4a52"`,
    );
  }
}
