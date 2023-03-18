import { Body, Controller, Post } from '@nestjs/common';
import { IssuesMigrationService } from './issues.migration.service';

interface IssuesLimitedOptions {
  pageSize?: number;
  pagesLimit?: number;
}

@Controller('issues')
export class IssuesController {
  constructor(private readonly migrationService: IssuesMigrationService) {}

  @Post('/migrate/limited')
  migrateLimited(@Body() { pageSize, pagesLimit }: IssuesLimitedOptions) {
    this.migrationService.migrateAllLimitedIssues(pageSize, pagesLimit);
    return 'in process';
  }
}
