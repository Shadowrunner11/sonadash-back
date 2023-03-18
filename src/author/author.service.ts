import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorDocument } from './models/author.schema';
import { sonarCollections } from 'src/types';

interface PaginationParams {
  page: number;
  limit?: number;
}

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(sonarCollections.AUTHORS)
    private readonly authorsModel: Model<AuthorDocument>,
  ) {}

  async getPaginatedAuthors({ page, limit = 10 }: PaginationParams) {
    const skip = (page - 1) * limit;
    const total = await this.authorsModel.count();
    const authors = await this.authorsModel.find().limit(10).skip(skip).lean();

    return {
      data: authors,
      pagination: {
        total,
        page,
      },
    };
  }
}
