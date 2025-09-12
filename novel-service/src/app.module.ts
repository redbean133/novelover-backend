import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NovelModule } from './modules/novel/novel.module';
import databaseConfig from './config/database.config';
import { AuthorModule } from './modules/author/author.module';
import { GenreModule } from './modules/genre/genre.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        ...configService.get<TypeOrmModuleOptions>('database'),
      }),
    }),
    NovelModule,
    AuthorModule,
    GenreModule,
  ],
})
export class AppModule {}
