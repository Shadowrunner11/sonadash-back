import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sonarCollections } from 'src/types';
import { ProjectsDocument } from './models/projects.schema';
import { createObjectCsvStringifier } from 'csv-writer';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(sonarCollections.PROJECTS)
    private projectModel: Model<ProjectsDocument>,
  ) {}

  findOneById(id: string) {
    return this.projectModel.findById(id);
  }

  async getReportCoverageMetrics() {
    const projects = await this.projectModel
      .find()
      .select({ sonarKey: 1, name: 1, coverageMetrics: 1, qualifier: 1 })
      .lean();

    const header = [
      { id: 'sonarKey', title: 'key' },
      { id: 'name', title: 'proyecto' },
      { id: 'observation', title: 'observacion' },
      { id: 'path', title: 'ruta' },
      { id: 'qualifier', title: 'tipo' },
      { id: 'totalCoveragePercent', title: '%Cobertura' },
      { id: 'linesToCover', title: 'lineas por cubrir' },
      { id: 'linesNoCoverage', title: 'lineas sin cobertura' },
      { id: 'linesCoveragePercent', title: '% Cobertura de lineas' },
    ];

    const parsedProjects = projects.map(({ coverageMetrics, ...rest }) => ({
      ...coverageMetrics,
      ...rest,
    }));

    const csvWriter = createObjectCsvStringifier({ header });

    return (
      csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedProjects)
    );
  }
}
