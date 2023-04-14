import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CoverageMetrics } from './measures.schema';
import { WithPagination } from 'src/tools/graphql/entitites/pagination.graphql';

@ObjectType()
export class Coverage extends CoverageMetrics {
  @Field(() => ID)
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedCoverageMetrics extends WithPagination {
  @Field(() => [Coverage], { nullable: 'items' })
  data: Coverage[];
}
