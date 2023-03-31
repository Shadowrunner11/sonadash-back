import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sonarCollections } from 'src/types';
import { Projects, ProjectsDocument } from './models/projects.schema';
import { createObjectCsvStringifier } from 'csv-writer';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

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
      dayUpdated: dayjs(updatedAt).tz('Etc/GMT-5').format('DD/MM/YYYY'),
      timeUpdated: dayjs(updatedAt).tz('Etc/GMT-5').format('HH:mm:ss'),
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
}
