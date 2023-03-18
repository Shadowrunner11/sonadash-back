import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { sonarCollections } from 'src/types';
import { IssueDocument } from './models/issue.schema';
import { CreateIssuesDTO } from './types';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(sonarCollections.ISSUES)
    private issueModel: Model<IssueDocument>,
  ) {}

  create(createIssueDTO: CreateIssuesDTO) {
    return this.issueModel.create(createIssueDTO);
  }
}
