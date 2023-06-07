import { createObjectCsvStringifier } from 'csv-writer';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Projects, ProjectsDocument } from './models/projects.schema';
import { PaginationParams, sonarCollections } from 'src/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { getPaginatedResults } from 'src/tools';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ProjectsService {
  private logger = new Logger(ProjectsService.name);

  private readonly headerMetrics = [
    { id: 'sonarKey', title: 'PROJECT KEY' },
    { id: 'name', title: 'PROJECT NAME' },
    { id: 'totalCoveragePercent', title: '% COVER' },
    { id: 'linesToCover', title: 'LINES TO COV' },
    { id: 'linesNoCoverage', title: 'LINES W/COV' },
    { id: 'linesCoveragePercent', title: '% LINE COVER' },
    { id: 'qtyConditionsToCover', title: 'COND TO COV' },
    { id: 'qtyConditionsWithoutCover', title: 'COND W/COV' },
    {
      id: 'conditionsCoveragePercentage',
      title: '% COND COV',
    },
    { id: 'dayUpdated', title: 'D. MIGRA BD' },
    { id: 'timeUpdated', title: 'H. MIGRA BD' },
  ];

  private readonly headerDuplicationMetrics = [
    { id: 'sonarKey', title: 'PROJECT KEY' },
    { id: 'name', title: 'PROJECT NAME' },
    { id: 'totalDensityPercent', title: '% DUPLIC' },
    { id: 'duplicatedLines', title: 'LINE DUPLIC' },
    { id: 'duplicatedBlocks', title: 'BLOCK DUPLIC' },
    { id: 'duplicatedFiles', title: 'FILE DUPLIC' },
    { id: 'dayUpdated', title: 'D. MIGRA BD' },
    { id: 'timeUpdated', title: 'H. MIGRA BD' },
  ];

  constructor(
    @InjectModel(sonarCollections.PROJECTS)
    private projectModel: Model<ProjectsDocument>,
  ) {}

  private readonly headersProject = [
    {
      id: 'sonarKey',
      title: 'PROJECT KEY',
    },
    {
      id: 'name',
      title: 'PROJECT NAME',
    },
    {
      id: 'linesOfCode',
      title: 'LINES OF COD',
    },
    {
      id: 'totalLines',
      title: 'LINES TOTAL',
    },
    {
      id: 'analysisDay',
      title: 'D. LAST ANALYSIS',
    },
    {
      id: 'analysisTime',
      title: 'H. LAST ANALYSIS',
    },
    {
      id: 'dayCreatedAt',
      title: 'D. MIGRA DB',
    },
    {
      id: 'timeCreatedAt',
      title: 'H. MIGRA DB',
    },
  ];

  async getReport() {
    const projectData: (Projects & { createdAt: Date })[] =
      await this.projectModel
        .find()
        .select({
          sonarKey: 1,
          analysisDate: 1,
          sizeMetrics: 1,
          name: 1,
        })
        .lean();

    const parsedProjectData = projectData.map(
      ({ createdAt, analysisDate, sizeMetrics, ...rest }) => ({
        ...sizeMetrics,
        ...rest,
        dayCreatedAt: dayjs(createdAt).tz('America/Lima').format('DD/MM/YYYY'),
        timeCreatedAt: dayjs(createdAt).tz('America/Lima').format('HH:mm:ss'),
        analysisDay: dayjs(analysisDate)
          .tz('America/Lima')
          .format('DD/MM/YYYY'),
        analysisTime: dayjs(analysisDate).tz('America/Lima').format('HH:mm:ss'),
      }),
    );

    const csvWriter = createObjectCsvStringifier({
      header: this.headersProject,
    });

    return (
      csvWriter.getHeaderString() +
      csvWriter.stringifyRecords(parsedProjectData)
    );
  }

  findOneById(id: string) {
    return this.projectModel.findById(id);
  }

  private parseProjects(projects: (Projects & { updatedAt: Date })[]) {
    return projects.map(({ coverageMetrics, updatedAt, ...rest }) => ({
      ...coverageMetrics,
      ...rest,
      dayUpdated: dayjs(updatedAt).tz('America/Lima').format('DD/MM/YYYY'),
      timeUpdated: dayjs(updatedAt).tz('America/Lima').format('HH:mm:ss'),
      observation: 'Cobertura',
    }));
  }

  private parseDuplicationByProjects(
    projects: (Projects & { updatedAt: Date })[],
  ) {
    return projects.map(({ duplicationMetrics, ...rest }) => ({
      ...duplicationMetrics,
      ...rest,
      dayUpdated: dayjs((duplicationMetrics as any).updatedAt)
        .tz('America/Lima')
        .format('DD/MM/YYYY'),
      timeUpdated: dayjs((duplicationMetrics as any).updatedAt)
        .tz('America/Lima')
        .format('HH:mm:ss'),
      observation: 'Codigo Duplicado',
    }));
  }

  async getReportCoverageMetrics() {
    const projects: (Projects & { updatedAt: Date; createdAt: Date })[] =
      await this.projectModel
        .find()
        .select({
          sonarKey: 1,
          name: 1,
          coverageMetrics: 1,
          qualifier: 1,
          updatedAt: 1,
          createdAt: 1,
        })
        .lean();

    const parsedProjects = this.parseProjects(projects);

    const csvWriter = createObjectCsvStringifier({
      header: this.headerMetrics,
    });

    const [{ createdAt }] = projects;

    return {
      timeString: dayjs(createdAt).tz('America/Lima').format('YYYY MM DD'),
      csvData:
        csvWriter.getHeaderString() +
        csvWriter.stringifyRecords(parsedProjects),
    };
  }

  async getReportDuplicationMetrics() {
    this.logger.log('init report duplications');

    const projects: (Projects & { updatedAt: Date; createdAt: Date })[] =
      await this.projectModel
        .find()
        .select({
          sonarKey: 1,
          name: 1,
          duplicationMetrics: 1,
          qualifier: 1,
          updatedAt: 1,
          createdAt: 1,
        })
        .lean();

    this.logger.log(projects.length);

    const parsedDuplicationByProjects =
      this.parseDuplicationByProjects(projects);

    const csvWriter = createObjectCsvStringifier({
      header: this.headerDuplicationMetrics,
    });

    const [{ createdAt }] = projects;

    return {
      csvData:
        csvWriter.getHeaderString() +
        csvWriter.stringifyRecords(parsedDuplicationByProjects),
      timeString: dayjs(createdAt).tz('America/Lima').format('YYYY MM DD'),
    };
  }

  getPaginatedProjects(params: PaginationParams) {
    return getPaginatedResults(this.projectModel, params);
  }

  async getPaginatedCoverageMetrics({ page, limit = 10 }: PaginationParams) {
    const total = await this.projectModel
      .count({
        coverageMetrics: { $ne: null },
      })
      .exec();

    const skip = (page - 1) * limit;
    const projects = await this.projectModel
      .find({
        coverageMetrics: { $ne: null },
      })
      .select({
        sonarKey: 1,
        name: 1,
        coverageMetrics: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const data = projects.map(({ coverageMetrics, sonarKey, name }) => ({
      ...coverageMetrics,
      sonarKey,
      name,
    }));

    return {
      data,
      pagination: {
        total,
        page,
      },
    };
  }

  async getPaginatedDuplicatedMetrics({ page, limit = 10 }: PaginationParams) {
    const total = await this.projectModel
      .count({
        duplicationMetrics: { $ne: null },
      })
      .exec();

    const skip = (page - 1) * limit;

    const projects = await this.projectModel
      .find({
        duplicationMetrics: { $ne: null },
      })
      .select({
        sonarKey: 1,
        name: 1,
        duplicationMetrics: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const data = projects.map(({ duplicationMetrics, sonarKey, name }) => ({
      ...duplicationMetrics,
      sonarKey,
      name,
    }));

    return {
      data,
      pagination: {
        total,
        page,
      },
    };
  }
}
