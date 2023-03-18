import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { sonarCollections } from 'src/types';
import { IssueSchema } from './models/issue.schema';
import { QueueModule } from 'src/queue/queue.module';
import { IssuesController } from './issues.controller';
import { IssuesMigrationService } from './issues.migration.service';
import { SonarDataSourceModule } from 'src/sonar-data-source/sonar-data-source.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: sonarCollections.ISSUES,
        schema: IssueSchema,
      },
    ]),
    QueueModule,
    SonarDataSourceModule,
  ],
  providers: [IssuesService, IssuesMigrationService],
  controllers: [IssuesController],
})
export class IssuesModule {}
