import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsSchema } from './models/projects.schema';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectsMigrationService } from './projects.migration.service';
import { SonarDataSourceModule } from 'src/sonar-data-source/sonar-data-source.module';
import { ProjectsResolver } from './project.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'project',
        schema: ProjectsSchema,
      },
    ]),
    SonarDataSourceModule,
  ],
  providers: [ProjectsService, ProjectsMigrationService, ProjectsResolver],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
