import {
  Body,
  Controller,
  Header,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import { IssuesMigrationService } from './issues.migration.service';
import { ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import type { IncomingHttpHeaders } from 'http';
import { getCredentialsFromBasicAuth } from 'src/tools';
import { IssuesService } from './issues.service';
import { IssuesFilter } from './models/issue.graphql';
import { Issue } from './models/issue.schema';

interface IssuesLimitedOptions {
  readonly pageSize?: number;
  readonly pagesLimit?: number;
}

class MigrateLimitDTO implements IssuesLimitedOptions {
  @ApiPropertyOptional()
  readonly pageSize?: number;
  @ApiPropertyOptional()
  readonly pagesLimit?: number;
}

interface IBodyReport {
  readonly filters: IssuesFilter;
  readonly fields: (keyof typeof Issue)[];
}

@ApiTags('issues', 'auth')
@Controller('issues')
export class IssuesController {
  private readonly logger = new Logger(IssuesController.name);
  constructor(
    private readonly migrationService: IssuesMigrationService,
    private readonly issueService: IssuesService,
  ) {}

  @Post('/migrate/limited')
  migrateLimited(
    @Headers() headers: IncomingHttpHeaders,
    @Body() body?: MigrateLimitDTO,
  ) {
    const { pageSize, pagesLimit } = body ?? {};
    const auth = headers.authorization;

    const parsedAuth = auth ? getCredentialsFromBasicAuth(auth) : undefined;

    this.migrationService
      .migrateAllLimitedIssues(pageSize, pagesLimit, parsedAuth)
      .catch((error) => {
        this.logger.error(error);
      });

    // TODO: inject dataSource to check for validation
    // TODO: or create a collection of migration status and return process id
    // to later check process status
    // Maybe that should be another connection, for example to postgres to insert logs
    // Or maybe have a logs status server, another backend and check for that
    return 'in process, if not provided correct credentials proccess may fail';
  }

  @Post('/report')
  @Header('content-type', 'text/csv')
  report(@Body() { fields, filters }: IBodyReport) {
    return this.issueService.createReport(filters, fields);
  }
}
