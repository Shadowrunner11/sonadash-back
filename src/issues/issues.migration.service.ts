import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import type { IssueDocument } from './models/issue.schema';
import type { CreateIssuesDTO } from './types';
import {
  Issue,
  PaginationParams,
  RequestPaginationsArgs,
} from 'src/sonar-data-source/types';
import { AxiosBasicCredentials } from 'axios';
import { getFirstLanguageFromFile } from 'src/tools';
import { sonarCollections } from 'src/types';

@Injectable()
export class IssuesMigrationService {
  private readonly logger = new Logger(IssuesMigrationService.name);
  constructor(
    @InjectModel(sonarCollections.ISSUES)
    private issueModel: Model<IssueDocument>,
    @Inject(SonarDataSourceService)
    private sonarDataSource: SonarDataSourceService,
  ) {}

  private parseIssue(issue: Issue): CreateIssuesDTO {
    const {
      key: sonarKey,
      type: observation,
      line: startLine = 0,
      author: developerEmail,
      creationDate: date,
      component: file,
      ...rest
    } = issue;

    return {
      sonarKey,
      observation,
      startLine,
      developerEmail,
      date,
      language: getFirstLanguageFromFile(file),
      file,
      ...rest,
    };
  }

  private async getParsedPaginatedIssues(
    requestParams?: RequestPaginationsArgs,
  ) {
    const { paging, issues } = await this.sonarDataSource.getPaginatedIssues(
      requestParams,
    );

    return {
      paging,
      issues: issues.map((issue) => this.parseIssue(issue)),
    };
  }

  async migrateIssues(requestParams?: RequestPaginationsArgs) {
    const parsedIssues = await this.getParsedPaginatedIssues(requestParams);

    const { issues } = parsedIssues;

    await this.issueModel.create(issues);

    this.logger.log(
      `Finished partial migration of ${JSON.stringify({
        totalIssues: issues.length,
      })}`,
    );

    return parsedIssues;
  }

  async getLatestDate(): Promise<Date | undefined> {
    const [mostRecentIssue] = await this.issueModel
      .find({})
      .sort({
        date: 'desc',
      })
      .limit(1)
      .lean();

    return mostRecentIssue?.date;
  }

  async migrateAllLimitedIssues(
    pageSize = 500,
    pagesLimit = 120,
    auth?: AxiosBasicCredentials,
  ) {
    pageSize = pageSize <= 500 ? pageSize : 500;

    const limitElasticSearch = 10_000;

    const date = await this.getLatestDate();

    console.log(date);

    const paginationParams: PaginationParams = {
      asc: true,
      ps: pageSize,
      // TODO: pasar a enum
      s: 'CREATION_DATE',
      // TODO: implementar filtro de fecha
    };

    const {
      paging: { total },
    } = await this.migrateIssues({
      auth,
      paginationParams,
    });

    this.issueModel.create();

    const maxPageLimit = Math.min(
      limitElasticSearch,
      pagesLimit,
      total / pageSize,
    );

    for (let index = 2; index <= maxPageLimit; index++) {
      await this.migrateIssues({
        auth,
        paginationParams: {
          ...paginationParams,
          p: index,
        },
      });
    }

    this.logger.log('Finishing migration');
  }
}
