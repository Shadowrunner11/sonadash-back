import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { sonarCollections } from 'src/types';
import { IssueDocument } from './models/issue.schema';
import { SonarDataSourceService } from 'src/sonar-data-source/sonar-data-source.service';

interface CreateIssueDTO {
  language: string;
}

@Injectable()
export class IssuesService {
  constructor(
    @Inject(sonarCollections.ISSUES) private issueModel: Model<IssueDocument>,
    private sonarDataSource: SonarDataSourceService,
  ) {}

  create(createIssueDTO: CreateIssueDTO) {
    return this.issueModel.create(createIssueDTO);
  }
}
