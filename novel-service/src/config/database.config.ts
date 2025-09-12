import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenvConfig({ path: '.env' });

export const databaseConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

export default registerAs('database', () => databaseConfig);
