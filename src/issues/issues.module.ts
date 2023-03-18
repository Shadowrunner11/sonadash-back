import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { sonarCollections } from 'src/types';
import { IssueSchema } from './models/issue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: sonarCollections.ISSUES,
        schema: IssueSchema,
      },
    ]),
  ],
  providers: [IssuesService],
})
export class IssuesModule {}
