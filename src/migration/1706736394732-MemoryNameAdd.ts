import { MigrationInterface, QueryRunner } from 'typeorm';

export class MemoryNameAdd1706736394732 implements MigrationInterface {
  name = 'MemoryNameAdd1706736394732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memories" RENAME COLUMN "source" TO "name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memories" RENAME COLUMN "name" TO "source"`,
    );
  }
}
