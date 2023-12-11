import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessagesAndMemories1701030855154 implements MigrationInterface {
  name = 'AddMessagesAndMemories1701030855154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "memories" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "content" text NOT NULL, "reflection" text NOT NULL, "tags" jsonb NOT NULL, "active" boolean NOT NULL DEFAULT true, "source" text NOT NULL, CONSTRAINT "PK_aaa0692d9496fe827b0568612f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" uuid NOT NULL, "conversationId" uuid NOT NULL, "human" character varying NOT NULL, "ai" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_751332fc6cc6fc576c6975cd07" ON "messages" ("conversationId", "createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_751332fc6cc6fc576c6975cd07"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "memories"`);
  }
}
