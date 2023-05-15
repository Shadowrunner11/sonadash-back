import {
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ProjectsMigrationService } from './projects.migration.service';
import { ProjectsService } from './projects.service';
import { Response } from 'express';

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
  async updateMeasures() {
    return await this.migrationService.migrateAllMeasures();
  }

  @Patch('/measures/new')
  async updateNewMeasures() {
    return await this.migrationService.updateNewMeasures();
  }

  @Put('/measures/:projectKey')
  async updateMeasuresByProjectKey(@Param('projectKey') projectKey: string) {
    return await this.migrationService.updateMeasuresByProject(projectKey);
  }

  @Get('/measures/coverage/report')
  @Header('content-type', 'text/csv')
  async getCoverageMetricsReport(@Res({ passthrough: true }) res: Response) {
    const { csvData, timeString } =
      await this.projectService.getReportCoverageMetrics();
    const fileName = `${timeString} - coverage`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}.csv"`,
    );

    return csvData;
  }

  @Get('/measures/duplication/report')
  @Header('content-type', 'text/csv')
  async getDuplicationMetricsReport(@Res({ passthrough: true }) res: Response) {
    const { csvData, timeString } =
      await this.projectService.getReportDuplicationMetrics();
    const fileName = `${timeString} - duplications`;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}.csv"`,
    );
    return csvData;
  }

  @Get('/report')
  @Header('content-type', 'text/csv')
  async getReport() {
    return await this.projectService.getReport();
  }
}
