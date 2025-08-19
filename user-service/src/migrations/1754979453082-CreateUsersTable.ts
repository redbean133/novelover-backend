import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1723456789012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '32',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '64',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'password_digest',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'smallint',
            default: 0, // Gender.UNKNOWN
            comment: '0: unknown, 1: male, 2: female',
          },
          {
            name: 'about',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'smallint',
            default: 0, // UserRole.NORMAL
            comment: '0: normal, 1: admin',
          },
          {
            name: 'status',
            type: 'smallint',
            default: 0, // UserStatus.NORMAL
            comment: '0: normal, 1: self-lock, 2: admin lock',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
