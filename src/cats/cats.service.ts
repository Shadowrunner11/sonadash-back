import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { CatDocument } from './models/cat.schema';

export interface CreateCatDTO {
  name: string;
  age: string;
  breed: string;
}

@Injectable()
export class CatsService {
  constructor(@InjectModel('cat') private catModel: Model<CatDocument>) {}

  async create(createCatDTO: CreateCatDTO) {
    const createdCat = await this.catModel.create(createCatDTO);

    return createdCat;
  }
}
