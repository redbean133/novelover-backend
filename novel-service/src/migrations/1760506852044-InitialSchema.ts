import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760506852044 implements MigrationInterface {
  name = 'InitialSchema1760506852044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "author" ("id" SERIAL NOT NULL, "name" character varying(64) NOT NULL, "biography" character varying(255), CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" SERIAL NOT NULL, "novel_id" integer NOT NULL, "user_id" character varying NOT NULL, "content" text NOT NULL, "rating" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d2103e1ef96445239e03e13fbb" ON "review" ("novel_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chapter_vote" ("id" SERIAL NOT NULL, "user_id" character varying NOT NULL, "chapter_id" integer NOT NULL, CONSTRAINT "UQ_6bda352b89503206e155de34ec6" UNIQUE ("user_id", "chapter_id"), CONSTRAINT "PK_6736fca0c5311ec4dc0ac0c38e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chapter" ("id" SERIAL NOT NULL, "novel_id" integer NOT NULL, "title" character varying NOT NULL DEFAULT '', "content" text NOT NULL DEFAULT '', "number_of_views" integer NOT NULL DEFAULT '0', "number_of_words" integer NOT NULL DEFAULT '0', "number_of_votes" integer NOT NULL DEFAULT '0', "is_published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP, "order_index" bigint NOT NULL, "prev_chapter_id" integer, "next_chapter_id" integer, "audio_url" character varying, "audio_version" integer, "content_version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_275bd1c62bed7dff839680614ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "novel" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "cover_url" character varying, "is_original" boolean NOT NULL DEFAULT false, "contributor_id" character varying NOT NULL, "number_of_chapters" integer NOT NULL DEFAULT '0', "number_of_published_chapters" integer NOT NULL DEFAULT '0', "number_of_reviews" integer NOT NULL DEFAULT '0', "total_review_points" integer NOT NULL DEFAULT '0', "number_of_votes" integer NOT NULL DEFAULT '0', "number_of_views" integer NOT NULL DEFAULT '0', "description" text, "average_rating" numeric(2,1) NOT NULL DEFAULT '0', "is_published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_completed" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), "latest_published_chapter_time" TIMESTAMP, "deleted_at" TIMESTAMP, "author_id" integer, CONSTRAINT "PK_b0fea0838ae7d287445c53d6139" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genre" ("id" SERIAL NOT NULL, "name" character varying(64) NOT NULL, "description" character varying(255), CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE ("name"), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "novel_genre" ("novel_id" integer NOT NULL, "genre_id" integer NOT NULL, CONSTRAINT "PK_fe9ae636ee9bd79a7943c84da34" PRIMARY KEY ("novel_id", "genre_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c931bdbcc759db23ebb390c1c" ON "novel_genre" ("novel_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c645089e4dfa149d7e4b9bba7b" ON "novel_genre" ("genre_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_2a484ebbc9a5d31cc5486fe1538" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chapter_vote" ADD CONSTRAINT "FK_d39eb2e80e3a9d94e81008959ee" FOREIGN KEY ("chapter_id") REFERENCES "chapter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chapter" ADD CONSTRAINT "FK_c06172a9239b0a21e7cedff9598" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "novel" ADD CONSTRAINT "FK_b60357a022235c6935508088802" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "novel_genre" ADD CONSTRAINT "FK_9c931bdbcc759db23ebb390c1c2" FOREIGN KEY ("novel_id") REFERENCES "novel"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "novel_genre" ADD CONSTRAINT "FK_c645089e4dfa149d7e4b9bba7be" FOREIGN KEY ("genre_id") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "novel_genre" DROP CONSTRAINT "FK_c645089e4dfa149d7e4b9bba7be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "novel_genre" DROP CONSTRAINT "FK_9c931bdbcc759db23ebb390c1c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "novel" DROP CONSTRAINT "FK_b60357a022235c6935508088802"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chapter" DROP CONSTRAINT "FK_c06172a9239b0a21e7cedff9598"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chapter_vote" DROP CONSTRAINT "FK_d39eb2e80e3a9d94e81008959ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_2a484ebbc9a5d31cc5486fe1538"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c645089e4dfa149d7e4b9bba7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c931bdbcc759db23ebb390c1c"`,
    );
    await queryRunner.query(`DROP TABLE "novel_genre"`);
    await queryRunner.query(`DROP TABLE "genre"`);
    await queryRunner.query(`DROP TABLE "novel"`);
    await queryRunner.query(`DROP TABLE "chapter"`);
    await queryRunner.query(`DROP TABLE "chapter_vote"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2103e1ef96445239e03e13fbb"`,
    );
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "author"`);
  }
}
