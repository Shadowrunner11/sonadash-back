import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { ProjectsDocument } from './models/projects.schema';
import type { Model } from 'mongoose';

@Injectable()
export class ProjectsMigrationService {
  constructor(
    @InjectModel('project') private projectModel: Model<ProjectsDocument>,
    @Inject(SonarDataSourceService)
    private sonarDataSource: SonarDataSourceService,
  ) {}

  async migrateAllProjects() {
    const allProjects = await this.sonarDataSource.getAllProjects();

    return this.projectModel.create(allProjects);
  }
}
