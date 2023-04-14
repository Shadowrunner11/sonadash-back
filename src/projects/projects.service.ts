import { createObjectCsvStringifier } from 'csv-writer';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Projects, ProjectsDocument } from './models/projects.schema';
import { PaginationParams, sonarCollections } from 'src/types';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { getPaginatedResults } from 'src/tools';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ProjectsService {
  private readonly headerMetrics = [
    { id: 'sonarKey', title: 'key' },
    { id: 'name', title: 'proyecto' },
    { id: 'observation', title: 'observacion' },
    { id: 'path', title: 'ruta' },
    { id: 'qualifier', title: 'tipo' },
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
    { id: 'path', title: 'Ruta' },
    { id: 'qualifier', title: 'Tipo' },
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
    return projects.map(({ duplicationMetrics, updatedAt, ...rest }) => ({
      ...duplicationMetrics,
      ...rest,
      dayUpdated: dayjs(updatedAt).tz('America/Lima').format('DD/MM/YYYY'),
      timeUpdated: dayjs(updatedAt).tz('America/Lima').format('HH:mm:ss'),
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
    const total = await this.projectModel.count({
      coverageMetrics: { $ne: null },
    });

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
      .lean();
    console.log(projects);

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
}
