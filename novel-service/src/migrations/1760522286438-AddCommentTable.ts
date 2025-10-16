import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentTable1760522286438 implements MigrationInterface {
  name = 'AddCommentTable1760522286438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."comments_target_type_enum" AS ENUM('novel', 'chapter')`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "content" text NOT NULL, "target_type" "public"."comments_target_type_enum" NOT NULL, "target_id" integer NOT NULL, "parent_id" integer, "root_id" integer, "replies_count" integer NOT NULL DEFAULT '0', "likes_count" integer NOT NULL DEFAULT '0', "is_edited" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parentId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c675567d2a58f0b07cef09c13" ON "comments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0205f8dc849fe8920139c6dbe" ON "comments" ("parent_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6435677f1f5c78219af368eacc" ON "comments" ("target_type", "target_id", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6435677f1f5c78219af368eacc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0205f8dc849fe8920139c6dbe"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c675567d2a58f0b07cef09c13"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TYPE "public"."comments_target_type_enum"`);
  }
}
