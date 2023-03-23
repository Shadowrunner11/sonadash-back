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
import { formatISOWithTUTCDate, getFirstLanguageFromFile } from 'src/tools';
import { sonarCollections } from 'src/types';
import { keyBy } from 'lodash';

interface TimePeriodArgs {
  days?: number;
  months?: number;
  weeks?: number;
  years?: number;
}

@Injectable()
export class IssuesMigrationService {
  private readonly logger = new Logger(IssuesMigrationService.name);
  private readonly limitElasticSearch = 10_000;
  constructor(
    @InjectModel(sonarCollections.ISSUES)
    private issueModel: Model<IssueDocument>,
    @Inject(SonarDataSourceService)
    private sonarDataSource: SonarDataSourceService,
  ) {}

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
    const alreadyPushed = await this.issueModel.find({
      sonarKey: { $in: issues.map(({ sonarKey }) => sonarKey) },
    });

    const alreadyPushedBy = keyBy(alreadyPushed, 'sonarKey');

    const filteredIssues = issues.filter(
      ({ sonarKey }) => !alreadyPushedBy[sonarKey],
    );

    await this.issueModel.create(filteredIssues);

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
        issueCreatedAt: 'desc',
      })
      .limit(1)
      .lean();

    return mostRecentIssue?.issueCreatedAt;
  }

  async migrateAllLimitedIssues(
    pageSize = 500,
    pagesLimit = 120,
    auth?: AxiosBasicCredentials,
  ) {
    pageSize = pageSize <= 500 ? pageSize : 500;

    const date = await this.getLatestDate();

    const paginationParams: PaginationParams = {
      asc: true,
      ps: pageSize,
      s: 'CREATION_DATE',
      ...(date ? { createdAfter: formatISOWithTUTCDate(date) } : {}),
    };

    const {
      paging: { total },
    } = await this.migrateIssues({
      auth,
      paginationParams,
    });

    this.issueModel.create();

    const maxPageLimit = Math.round(
      Math.min(
        this.limitElasticSearch / pageSize,
        pagesLimit,
        total / pageSize,
      ),
    );

    this.logger.log(`Starting offset migration ${maxPageLimit} pages`);

    for (let index = 2; index <= maxPageLimit; index++) {
      this.logger.log(
        `Startting partial migration ${JSON.stringify({
          ...paginationParams,
          p: index,
        })}`,
      );
      await this.migrateIssues({
        auth,
        paginationParams: {
          ...paginationParams,
          p: index,
        },
      });
      this.logger.log(`Finished partial migration ${index} of ${maxPageLimit}`);
    }

    this.logger.log('Finishing migration');
  }

  private formatSinglePeriod(sufix: string, qty?: number) {
    return qty ? qty + sufix : '';
  }

  private formatPeriodOfTime(periodOfTime: TimePeriodArgs) {
    return ['years', 'months', 'weeks', 'days', 'hours'].reduce(
      (prev, periodKey) => {
        const periodQty = periodOfTime[periodKey as keyof typeof periodOfTime];
        const [sufix] = periodKey;

        return prev + this.formatSinglePeriod(sufix, periodQty);
      },
      '',
    );
  }

  async migrateByTimePeriod(
    periodOfTime: TimePeriodArgs,
    requestParams?: RequestPaginationsArgs,
  ) {
    const { auth, paginationParams } = requestParams ?? {};

    const createdInLast = this.formatPeriodOfTime(periodOfTime);
    const {
      paging: { total, pageSize, pageIndex },
    } = await this.migrateIssues({
      auth,
      paginationParams: {
        ...paginationParams,
        createdInLast,
      },
    });

    const maxPageLimit = Math.round(
      Math.min(this.limitElasticSearch, total / pageSize),
    );

    const emptyArray = Array.from(Array(maxPageLimit));

    return Promise.all(
      emptyArray.map((_, index) =>
        this.migrateIssues({
          auth,
          paginationParams: {
            ...paginationParams,
            p: pageIndex + index + 2,
            createdInLast,
          },
        }),
      ),
    );
  }

  migrateLastWeek() {
    return this.migrateByTimePeriod({ weeks: 1 });
  }

  private parseIssue(issue: Issue): CreateIssuesDTO {
    const {
      key: sonarKey,
      type: observation,
      line: startLine = 0,
      author: developerEmail,
      creationDate: issueCreatedAt,
      component: file,
      updateDate: issueUpdatedAt,
      message: sonarRuleMessage,
      hash: sonarHash,
      ...rest
    } = issue;

    return {
      sonarKey,
      observation,
      startLine,
      developerEmail,
      issueCreatedAt,
      language: getFirstLanguageFromFile(file),
      file,
      issueUpdatedAt,
      sonarRuleMessage,
      sonarHash,
      ...rest,
    };
  }
}
