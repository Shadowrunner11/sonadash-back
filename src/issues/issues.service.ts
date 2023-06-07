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
    { id: 'sonarKey', title: 'ISSUE KEY' },
    { id: 'observation', title: 'ISSUE' },
    { id: 'severity', title: 'SEVERITY' },
    { id: 'language', title: 'LENGUAGE' },
    { id: 'rule', title: 'RULE' },
    { id: 'startLine', title: 'LINES OF CODE' },
    { id: 'status', title: 'STATUS' },
    { id: 'project', title: 'PROJECT NAME' },
    { id: 'developerEmail', title: 'AUTHOR' },
    { id: 'issueCreatedAtDay', title: 'D. ISSUE DET' },
    { id: 'issueCreatedAtTime', title: 'H. ISSUE DET' },
    { id: 'issueUpdatedAtDay', title: 'D. ISSUE UPD' },
    { id: 'issueUpdatedAtTime', title: 'H. ISSUE UPD' },
    { id: 'migrationDay', title: 'D. MIGRA BD' },
    { id: 'migrationTime', title: 'H. MIGRA BD' },
    { id: 'commitDay', title: 'D. COMMIT' },
    { id: 'commitTime', title: 'H. COMMIT' },
    { id: 'file', title: 'ARCHIVE' },
    { id: 'sonarRuleMessage', title: 'SUGGESTION' },
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

  private preParseIssuesToCSV(issues: (Issue & { createdAt: Date })[]) {
    return issues.map(
      ({ issueCreatedAt, issueUpdatedAt, createdAt, ...rest }) => ({
        ...rest,
        issueCreatedAt: this.helperFormatDate(issueCreatedAt),
        issueUpdatedAt: this.helperFormatDate(issueUpdatedAt),
        dayCreated: dayjs(createdAt).tz('America/Lima').format('DD/MM/YYYY'),
        timeCreated: dayjs(createdAt).tz('America/Lima').format('HH:mm:ss'),
      }),
    );
  }

  private readonly headers = [
    { id: 'dayCreated', title: 'Dia de muestra' },
    { id: 'timeCreated', title: 'Hora de muestra' },
  ];

  // TODO: should not return a string, but a readable stream to avoid problems with memory
  // TODO: check the possibility to have a limit, and in case of reachin it, separate the spreadsheets
  // TODO: investigate about solutions to avoid using in memory, maybe partially appending to a file in the server and then deleting it
  async createReport(filter?: IssuesFilter, fields?: (keyof typeof Issue)[]) {
    this.logger.debug(filter);
    const parsedFilter = filter ? buildFilter({ ...filter }) : {};

    const issues: (Issue & { createdAt: Date })[] = await this.issueModel
      .find(parsedFilter)
      .lean();

    const parsedIssues = this.preParseIssuesToCSV(issues);

    const header = (
      fields ??
      Object.keys(
        omit(this.issueModel.schema.obj, ['_id', 'createdAt', 'updatedAt']),
      )
    )
      .map((key) => ({ id: key, title: key }))
      .concat(this.headers);

    const csvWriter = createObjectCsvStringifier({ header });

    return (
      csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedIssues)
    );
  }

  private parseIssues(issues: (Issue & { createdAt: Date })[]) {
    return issues.map(
      ({ issueCreatedAt, issueUpdatedAt, createdAt, commitDate, ...rest }) => {
        const issueCreatedAtDay = getDay(issueCreatedAt);
        const issueCreatedAtTime = getTime(issueCreatedAt);

        const issueUpdatedAtDay = issueUpdatedAt
          ? getDay(issueUpdatedAt)
          : issueCreatedAtDay;
        const issueUpdatedAtTime = issueUpdatedAt
          ? getTime(issueUpdatedAt)
          : issueCreatedAtTime;
        const migrationDate = dayjs(createdAt).tz('America/Lima');

        const commitParsedDate = dayjs(commitDate).tz('America/Lima');

        return {
          ...rest,
          issueCreatedAtDay,
          issueCreatedAtTime,
          issueUpdatedAtDay,
          issueUpdatedAtTime,
          migrationTime: migrationDate.format('HH:mm:ss'),
          migrationDay: migrationDate.format('DD/MM/YYYY'),
          commitDay: commitDate ? commitParsedDate.format('DD/MM/YYYY') : '--',
          commitTime: commitDate ? commitParsedDate.format('HH:mm:ss') : '--',
        };
      },
    );
  }

  async getReportDataSpanish(filter?: IssuesFilter) {
    const parsedFilter = filter ? buildFilter({ ...filter }) : {};
    /*     console.log('asda', filter, parsedFilter);
    const a = true;
    if (a) throw 'asdasd'; */
    const issues: (Issue & { createdAt: Date; updatedAt: Date })[] =
      await this.issueModel.find(parsedFilter).lean();

    const parsedIssues = this.parseIssues(issues);

    const csvWriter = createObjectCsvStringifier({
      header: this.issuesCustomHeader,
    });

    const [{ createdAt }] = issues;

    return {
      csvData:
        csvWriter.getHeaderString() + csvWriter.stringifyRecords(parsedIssues),
      timeString: dayjs(createdAt).tz('America/Lima').format('YYYY MM DD'),
    };
  }
}
