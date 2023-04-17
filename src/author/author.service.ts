import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorDocument } from './models/author.schema';
import { PaginationParams, sonarCollections } from 'src/types';
import { getPaginatedResults } from 'src/tools';
import { CreateAuthorsDTO } from './types';
import { AuthorsFilters } from './models/author.grapqhl';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(sonarCollections.AUTHORS)
    private readonly authorsModel: Model<AuthorDocument>,
  ) {}

  getPaginatedAuthors(params: PaginationParams, filter?: AuthorsFilters) {
    return getPaginatedResults(this.authorsModel, params, { ...filter });
  }

  async bulkUpsertAuthors(data: CreateAuthorsDTO[]) {
    const authorsEmailsToUpdate = await this.authorsModel.distinct('email', {
      email: { $in: data.map(({ email }) => email) },
    });

    const authorsByEmail = authorsEmailsToUpdate.reduce((acumPojo, email) => {
      acumPojo[email] = 1;

      return acumPojo;
    }, {});

    const authorsToCreate = data.filter(({ email }) => !authorsByEmail[email]);

    const authorsToUpdate = data.filter(({ email }) => authorsByEmail[email]);

    await this.authorsModel.insertMany(authorsToCreate);

    const bulkUpdatePipeline = authorsToUpdate.map(({ email, ...rest }) => ({
      updateOne: {
        filter: {
          email,
        },
        update: {
          $set: rest,
        },
      },
    }));

    await this.authorsModel.bulkWrite(bulkUpdatePipeline);
  }
}
