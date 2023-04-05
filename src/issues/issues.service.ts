import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaginationParams, sonarCollections } from 'src/types';
import { Issue, IssueDocument } from './models/issue.schema';
import { CreateIssuesDTO } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { buildFilter, getPaginatedResults } from 'src/tools';
import { IssuesFilter } from './models/issue.graphql';
import { createObjectCsvStringifier } from 'csv-writer';
import { omit } from 'lodash';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getDay, getTime } from 'src/tools/date';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class IssuesService {
  private readonly issuesCustomHeader = [
    { id: 'observation', title: 'Observacion' },
    { id: 'severity', title: 'Severidad' },
    { id: 'language', title: 'Lenguaje' },
    { id: 'rule', title: 'Regla' },
    { id: 'startLine', title: 'Linea de codigo' },
    { id: 'developerEmail', title: 'Developer' },
    { id: 'issueCreatedAtDay', title: 'Dia de creacion' },
    { id: 'issueCreatedAtTime', title: 'Hora de creacion' },
    { id: 'issueUpdatedAtDay', title: 'Dia de actualizacion' },
    { id: 'issueUpdatedAtTime', title: 'Hora de actualizacion' },
    { id: 'file', title: 'Archivo' },
  ];

  private readonly logger = new Logger(IssuesService.name);

  constructor(
    @InjectModel(sonarCollections.ISSUES)
    private issueModel: Model<IssueDocument>,
  ) {}

  create(createIssueDTO: CreateIssuesDTO) {
    return this.issueModel.create(createIssueDTO);
  }

  findById(id: string) {
    return this.issueModel.findById(id);
  }

  getPaginatedIssues(params: PaginationParams, filter?: IssuesFilter) {
    return getPaginatedResults(this.issueModel, params, { ...filter });
  }

  private helperFormatDate(date?: Date) {
    return dayjs(date).tz('utc').format('DD/MM/YYYY HH:mm:ss');
  }

  private preParseIssuesToCSV(issues: Issue[]) {
    return issues.map(({ issueCreatedAt, issueUpdatedAt, ...rest }) => ({
      ...rest,
      issueCreatedAt: this.helperFormatDate(issueCreatedAt),
      issueUpdatedAt: this.helperFormatDate(issueUpdatedAt),
    }));
  }

  // TODO: shoulkd not return a string, but a readble stream to avoid problems with memory
  // TODO: check the psoibility to have a limit, and in case of reachin it, separate the spreadsheets
  // TODO: investigate about soluions to avoid using in memory, maybe partially appending to a file in the server and then deleting it
  async createReport(filter?: IssuesFilter, fields?: (keyof typeof Issue)[]) {
    this.logger.debug(filter);
    const parsedFilter = filter ? buildFilter({ ...filter }) : {};
    const issues = await this.issueModel.find(parsedFilter).lean();
    const parsedIssues = this.preParseIssuesToCSV(issues);

    const header = (
      fields ??
      Object.keys(
        omit(this.issueModel.schema.obj, ['_id', 'createdAt', 'updatedAt']),
      )
    ).map((key) => ({ id: key, title: key }));

    const csvWriter = createObjectCsvStringifier({ header });

    return (
      csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedIssues)
    );
  }

  private parseIssues(issues: Issue[]) {
    return issues.map(({ issueCreatedAt, issueUpdatedAt, ...rest }) => {
      const issueCreatedAtDay = getDay(issueCreatedAt);
      const issueCreatedAtTime = getTime(issueCreatedAt);

      const issueUpdatedAtDay = issueUpdatedAt
        ? getDay(issueUpdatedAt)
        : issueCreatedAtDay;
      const issueUpdatedAtTime = issueUpdatedAt
        ? getTime(issueUpdatedAt)
        : issueCreatedAtTime;

      return {
        ...rest,
        issueCreatedAtDay,
        issueCreatedAtTime,
        issueUpdatedAtDay,
        issueUpdatedAtTime,
      };
    });
  }

  async createReportSpanish(filter?: IssuesFilter) {
    const parsedFilter = filter ? buildFilter({ ...filter }) : {};
    const issues = await this.issueModel.find(parsedFilter).lean();

    const parsedIssues = this.parseIssues(issues);

    const csvWriter = createObjectCsvStringifier({
      header: this.issuesCustomHeader,
    });

    return (
      csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedIssues)
    );
  }
}
