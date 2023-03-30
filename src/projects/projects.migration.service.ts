import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { ProjectsDocument } from './models/projects.schema';
import type { CreateProjectsDTO } from './types';

@Injectable()
export class ProjectsMigrationService {
  constructor(
    @InjectModel('project') private projectModel: Model<ProjectsDocument>,
    @Inject(SonarDataSourceService)
    private sonarDataSource: SonarDataSourceService,
  ) {}

  async migrateAllProjects() {
    const allProjects = await this.sonarDataSource.getAllProjects();

    const parsedAllProjects: CreateProjectsDTO[] = allProjects.map(
      ({ key, ...rest }) => ({
        ...rest,
        sonarKey: key,
      }),
    );

    return this.projectModel.create(parsedAllProjects);
  }

  async updateMeasuresByProject(projectkey: string) {
    const metrics = await this.sonarDataSource.getMetricByProject(projectkey);

    const parsedMetrics = metrics.map(({ ...metric }) => ({
      ...metric,
    }));

    this.projectModel.updateOne(
      { sonarKey: projectkey },
      {
        $set: {
          metrics: parsedMetrics,
        },
      },
    );
  }

  async updateAllMeasuresByProject() {
    const projectKeys = await this.projectModel.distinct('sonarkey');
    projectKeys.map((projectkey) => {
      this.updateMeasuresByProject(projectkey);
    });
  }
}
