import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { ProjectsDocument } from './models/projects.schema';
import type { CreateProjectsDTO } from './types';
import type { Measure } from 'src/sonar-data-source/types';
import { batchProccess } from 'src/tools';

const coverageDictionary: Record<string, string> = {
  coverage: 'totalCoveragePercent',
  lines_to_cover: 'linesToCover',
  uncovered_lines: 'linesNoCoverage',
  line_coverage: 'linesCoveragePercent',
  conditions_to_cover: 'qtyConditionsToCover',
  uncovered_conditions: 'qtyConditionsWithoutCover',
  branch_coverage: 'conditionsCoveragePercentage',
};

const duplicationDictionary: Record<string, string> = {
  duplicated_lines: 'duplicatedLines',
  duplicated_lines_density: 'totalDensityPercent',
  duplicated_blocks: 'duplicatedBlocks',
  duplicated_files: 'duplicatedFiles',
};

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

  private parseMetricsfromSonar(
    metrics: Measure[],
    metricsFieldsEquivalance: Record<string, string>,
  ) {
    return metrics.reduce((prev: Record<string, number>, { metric, value }) => {
      const propertyName = metricsFieldsEquivalance[metric];

      if (propertyName) prev[propertyName] = value;
      return prev;
    }, {});
  }

  async updateMeasuresByProject(projectkey: string) {
    const metrics = await this.sonarDataSource.getMetricByProject(projectkey);

    const parsedCoverageMetrics = this.parseMetricsfromSonar(
      metrics,
      coverageDictionary,
    );

    const parsedDuplicationMetrics = this.parseMetricsfromSonar(
      metrics,
      duplicationDictionary,
    );

    await this.projectModel.updateOne(
      { sonarKey: projectkey },
      {
        coverageMetrics: parsedCoverageMetrics,
        duplicationMetrics: parsedDuplicationMetrics,
      },
    );
  }

  async updateAllMeasures() {
    const projectKeys = await this.projectModel.distinct('sonarKey');

    return batchProccess(
      projectKeys,
      (projectkey) => this.updateMeasuresByProject(projectkey),
      10,
    );
  }
}
