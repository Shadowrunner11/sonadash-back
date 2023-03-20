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

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class IssuesService {
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
}
