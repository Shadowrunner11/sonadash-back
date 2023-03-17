import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';

@Module({
  providers: [IssuesService],
})
export class IssuesModule {}
