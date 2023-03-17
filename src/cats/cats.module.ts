import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatSchema } from './models/cat.schema';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'cat',
        schema: CatSchema,
      },
    ]),
  ],
  providers: [CatsService],
  controllers: [CatsController],
})
export class CatsModule {}
