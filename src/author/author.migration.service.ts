import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';
import type { AuthorDocument } from './models/author.schema';
import { sonarCollections } from 'src/types';
import { FacetValues, Value } from 'src/sonar-data-source/types';
import { ProjectsDocument } from 'src/projects/models/projects.schema';
import { keyBy } from 'lodash';
import { CreateAuthorsDTO } from './types';
import dayjs from 'dayjs';
import { AxiosBasicCredentials } from 'axios';
import { formatISOWithTUTCDate } from 'src/tools';

@Injectable()
export class AuthorMigrationService {
  private readonly logger = new Logger(AuthorMigrationService.name);
  constructor(
    @InjectModel(sonarCollections.AUTHORS)
    private readonly authorModel: Model<AuthorDocument>,
    @InjectModel(sonarCollections.PROJECTS)
    private readonly projectModel: Model<ProjectsDocument>,
    @Inject(SonarDataSourceService)
    private readonly sonarDataSource: SonarDataSourceService,
  ) {}

  async createAuthors(authors: Value[]) {
    const authorsBy = keyBy(authors, 'val');
    const emails = Object.keys(authorsBy);

    const alreadyPushed = await this.authorModel
      .find({ email: { $in: emails } })
      .lean();

    const alreadyPushedBy = keyBy(alreadyPushed, 'email');

    const filteredAuthors: CreateAuthorsDTO[] = emails
      .filter((email) => !alreadyPushedBy[email])
      .map((email) => ({ email }));

    await this.authorModel.create(filteredAuthors);
  }

  async migrateAllAuthor(batchSize = 10) {
    // eslint-disable-next-line no-console
    console.time('migration time');
    const projects = await this.projectModel
      .find()
      .sort({
        createdAt: 'asc',
      })
      .select({ sonarKey: 1 })
      .lean();

    const { length: initialLength } = projects;

    // TODO: use queue or create a batch process util
    while (projects.length) {
      this.logger.log(
        `Init migration of authors, iteration ${Math.round(
          (initialLength - projects.length) / batchSize,
        )}`,
      );

      const projectsBatch = projects.splice(0, batchSize);
      const batchResults = await Promise.allSettled(
        projectsBatch.map(({ sonarKey }) =>
          this.sonarDataSource.getSingleFacetsByProject(
            FacetValues.AUTHORS,
            sonarKey,
          ),
        ),
      );

      const authorsFullfiled = batchResults.filter(
        (result) => result.status === 'fulfilled' && Boolean(result.value),
      ) as PromiseFulfilledResult<Value[]>[];

      const authors = authorsFullfiled.flatMap(({ value }) => value);

      await this.createAuthors(authors);

      this.logger.log(
        `Finished migration batch authors, remainig ${projects.length}`,
      );
    }

    // eslint-disable-next-line no-console
    console.timeEnd('migration time');
  }

  async migrateLatestAuthors(
    date = dayjs().subtract(1, 'week').toDate(),
    auth?: AxiosBasicCredentials,
  ) {
    const { facets } = await this.sonarDataSource.getPaginatedIssues({
      auth,
      paginationParams: {
        ps: 500,
        facets: FacetValues.AUTHORS,
        createdAfter: formatISOWithTUTCDate(date),
      },
    });

    const authors = facets.flatMap(({ values }) => values);

    return this.createAuthors(authors);
  }
}
