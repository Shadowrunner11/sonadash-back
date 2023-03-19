import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorDocument } from './models/author.schema';
import { PaginationParams, sonarCollections } from 'src/types';
import { getPaginatedResults } from 'src/tools';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(sonarCollections.AUTHORS)
    private readonly authorsModel: Model<AuthorDocument>,
  ) {}

  getPaginatedAuthors(params: PaginationParams) {
    return getPaginatedResults(this.authorsModel, params);
  }
}
