import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sonarCollections } from 'src/types';
import { ProjectsDocument } from './models/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(sonarCollections.PROJECTS)
    private projectModel: Model<ProjectsDocument>,
  ) {}

  findOneById(id: string) {
    return this.projectModel.findById(id);
  }
}
