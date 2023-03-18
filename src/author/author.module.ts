import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { AuthorMigrationService } from './author.migration.service';
import { MongooseModule } from '@nestjs/mongoose';
import { sonarCollections } from 'src/types';
import { AuthorSchema } from './models/author.schema';
import { SonarDataSourceModule } from 'src/sonar-data-source/sonar-data-source.module';
import { ProjectsSchema } from 'src/projects/models/projects.schema';
import { AuthorsResolver } from './author.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: sonarCollections.AUTHORS,
        schema: AuthorSchema,
      },
      {
        name: sonarCollections.PROJECTS,
        schema: ProjectsSchema,
      },
    ]),
    SonarDataSourceModule,
  ],
  providers: [AuthorService, AuthorMigrationService, AuthorsResolver],
  controllers: [AuthorController],
})
export class AuthorModule {}
