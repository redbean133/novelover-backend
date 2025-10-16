import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrigramIndexForNovelTitleAndAuthorName1760510617686
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_novel_title_trgm 
      ON novel 
      USING gin(title gin_trgm_ops);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_author_name_trgm 
      ON author 
      USING gin(name gin_trgm_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_novel_title_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_author_name_trgm;`);
  }
}
