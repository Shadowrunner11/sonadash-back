import {
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ProjectsMigrationService } from './projects.migration.service';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private migrationService: ProjectsMigrationService,
    private projectService: ProjectsService,
  ) {}

  @Post('/migrate/all')
  migrateAll() {
    return this.migrationService.migrateAllProjects();
  }

  @Patch('/measures/all')
  updateMeasures() {
    return this.migrationService.migrateAllMeasures();
  }

  @Patch('/measures/new')
  updateNewMeasures() {
    return this.migrationService.updateNewMeasures();
  }

  @Put('/measures/:projectKey')
  updateMeausresByProjectKey(@Param('projectKey') projectKey: string) {
    return this.migrationService.updateMeasuresByProject(projectKey);
  }

  @Get('/measures/coverage/report')
  @Header('content-type', 'text/csv')
  getCoverageMetricsReport() {
    return this.projectService.getReportCoverageMetrics();
  }

  @Get('measures/duplication/report')
  @Header('content-type', 'text/csv')
  getDuplicationMetricsReport() {
    return this.projectService.getReportDuplicationMetrics();
  }
}
