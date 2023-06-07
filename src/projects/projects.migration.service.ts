import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import { ProjectsDocument } from './models/projects.schema';
import type { CreateProjectsDTO } from './types';
import type { Measure } from 'src/sonar-data-source/types';
import dayjs from 'dayjs';

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

const sizeDictionary = {
  ncloc: 'linesOfCode',
  lines: 'totalLines',
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

    const alreadyMigratedProjects = await this.projectModel
      .distinct('sonarKey')
      .exec();

    const alreadyMigratedProjectsBy = alreadyMigratedProjects.reduce(
      (acum, sonarKey) => {
        acum[sonarKey] = true;
        return acum;
      },
      {},
    );

    const projectsToMigrate = allProjects.filter(
      ({ key }) => !alreadyMigratedProjectsBy[key],
    );

    const parsedAllProjects: CreateProjectsDTO[] = projectsToMigrate.map(
      ({ key, ...rest }) => ({
        ...rest,
        sonarKey: key,
      }),
    );

    return await this.projectModel.create(parsedAllProjects);
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

  private async getParsedProjectMesaures(projectKey: string) {
    const metrics = await this.sonarDataSource.getMetricByProject(projectKey);

    const parsedCoverageMetrics = this.parseMetricsfromSonar(
      metrics,
      coverageDictionary,
    );

    const parsedDuplicationMetrics = this.parseMetricsfromSonar(
      metrics,
      duplicationDictionary,
    );

    const parsedSizeMetrics = this.parseMetricsfromSonar(
      metrics,
      sizeDictionary,
    );

    return {
      parsedCoverageMetrics,
      parsedDuplicationMetrics,
      parsedSizeMetrics,
    };
  }

  async updateMeasuresByProject(projectkey: string) {
    const { parsedCoverageMetrics, parsedDuplicationMetrics } =
      await this.getParsedProjectMesaures(projectkey);

    await this.projectModel
      .updateOne(
        { sonarKey: projectkey },
        {
          coverageMetrics: parsedCoverageMetrics,
          duplicationMetrics: parsedDuplicationMetrics,
        },
      )
      .exec();
  }

  private async updateMeasurePipeline(projectKey: string) {
    const {
      parsedCoverageMetrics,
      parsedDuplicationMetrics,
      parsedSizeMetrics,
    } = await this.getParsedProjectMesaures(projectKey);

    return {
      updateOne: {
        filter: {
          sonarKey: projectKey,
        },
        update: {
          $set: {
            coverageMetrics: parsedCoverageMetrics,
            duplicationMetrics: parsedDuplicationMetrics,
            sizeMetrics: parsedSizeMetrics,
          },
        },
      },
    };
  }

  private async bulkUpdateMeasures(projectKeys: string[]) {
    const bulkPipeline = await Promise.all(
      projectKeys.map((projectKey) => this.updateMeasurePipeline(projectKey)),
    );

    return await this.projectModel.bulkWrite(bulkPipeline);
  }

  private async writeMeasures(projectKeys: string[], limit: number) {
    const results = [];
    while (projectKeys.length) {
      const partialProjectKeys = projectKeys.splice(0, limit);

      const partialResult = await this.bulkUpdateMeasures(partialProjectKeys);

      results.push(partialResult);
    }

    return results;
  }

  async migrateAllMeasures(limit = 20) {
    const projectKeys = await this.projectModel.distinct('sonarKey').exec();

    return await this.writeMeasures(projectKeys, limit);
  }

  async updateNewMeasures(limit = 20) {
    const oldDataFilter = { $lte: dayjs().subtract(1, 'week').toDate() };

    const projectKeys = await this.projectModel
      .distinct('sonarKey', {
        $or: [
          { 'coverageMetrics.updatedAt': oldDataFilter },
          { coverageMetrics: null },
          { 'duplicationMetrics.updatedAt': oldDataFilter },
          { duplicationMetrics: null },
        ],
      })
      .exec();

    return await this.writeMeasures(projectKeys, limit);
  }
}
