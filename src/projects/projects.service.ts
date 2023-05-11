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
    { id: 'sonarKey', title: 'key' },
    { id: 'name', title: 'proyecto' },
    { id: 'observation', title: 'observacion' },
    { id: 'totalCoveragePercent', title: '%Cobertura' },
    { id: 'linesToCover', title: 'lineas por cubrir' },
    { id: 'linesNoCoverage', title: 'lineas sin cobertura' },
    { id: 'linesCoveragePercent', title: '% Cobertura de lineas' },
    { id: 'qtyConditionsToCover', title: 'Condiciones por cubrir' },
    { id: 'qtyConditionsWithoutCover', title: 'Condiciones sin cobertura' },
    {
      id: 'conditionsCoveragePercentage',
      title: '% Cobertura de condiciones',
    },
    { id: 'dayUpdated', title: 'Dia de muestra' },
    { id: 'timeUpdated', title: 'Hora de muestra' },
  ];

  private readonly headerDuplicationMetrics = [
    { id: 'sonarKey', title: 'Project Key' },
    { id: 'name', title: 'Project Name' },
    { id: 'observation', title: 'Observacion' },
    { id: 'totalDensityPercent', title: '%Densidad' },
    { id: 'duplicatedLines', title: 'Lineas Duplicadas' },
    { id: 'duplicatedBlocks', title: 'Bloques Duplicados' },
    { id: 'duplicatedFiles', title: 'Archivos Duplicados' },
    { id: 'dayUpdated', title: 'Dia de muestra' },
    { id: 'timeUpdated', title: 'Hora de muestra' },
  ];

  constructor(
    @InjectModel(sonarCollections.PROJECTS)
    private projectModel: Model<ProjectsDocument>,
  ) {}

  private readonly headersProject = [
    {
      id: 'dayCreatedAt',
      title: 'Dia de muestra',
    },
    {
      id: 'timeCreatedAt',
      title: 'Hora de muestra',
    },
    {
      id: 'linesOfCode',
      title: 'Líneas de código',
    },
    {
      id: 'totalLines',
      title: 'Lineas totales',
    },
    {
      id: 'sonarKey',
      title: 'Sonar key',
    },
    {
      id: 'name',
      title: 'Sonar name',
    },
    {
      id: 'analysisDay',
      title: 'Dia de analisis',
    },
    {
      id: 'analysisTime',
      title: 'Hora de analisis',
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
    const projects: (Projects & { updatedAt: Date })[] = await this.projectModel
      .find()
      .select({
        sonarKey: 1,
        name: 1,
        coverageMetrics: 1,
        qualifier: 1,
        updatedAt: 1,
      })
      .lean();

    const parsedProjects = this.parseProjects(projects);

    const csvWriter = createObjectCsvStringifier({
      header: this.headerMetrics,
    });

    return (
      csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedProjects)
    );
  }

  async getReportDuplicationMetrics() {
    this.logger.log('init report duplications');

    const projects: (Projects & { updatedAt: Date })[] = await this.projectModel
      .find()
      .select({
        sonarKey: 1,
        name: 1,
        duplicationMetrics: 1,
        qualifier: 1,
        updatedAt: 1,
      })
      .lean();

    this.logger.log(projects.length);

    const parsedDuplicationByProjects =
      this.parseDuplicationByProjects(projects);

    const csvWriter = createObjectCsvStringifier({
      header: this.headerDuplicationMetrics,
    });

    return (
      csvWriter.getHeaderString() +
      csvWriter.stringifyRecords(parsedDuplicationByProjects)
    );
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
