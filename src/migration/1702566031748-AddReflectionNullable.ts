import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReflectionNullable1702566031748 implements MigrationInterface {
  name = 'AddReflectionNullable1702566031748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memories" ALTER COLUMN "reflection" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memories" ALTER COLUMN "reflection" SET NOT NULL`,
    );
  }
}
