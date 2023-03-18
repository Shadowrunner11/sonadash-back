import { Controller, Post } from '@nestjs/common';
import { ProjectsMigrationService } from './projects.migration.service';

@Controller('projects')
export class ProjectsController {
  constructor(private migrationService: ProjectsMigrationService) {}

  @Post('/migrate/all')
  migrateAll() {
    return this.migrationService.migrateAllProjects();
  }
}
