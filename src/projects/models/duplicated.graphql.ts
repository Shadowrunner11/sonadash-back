import { Field, ID, ObjectType } from '@nestjs/graphql';
import { DuplicationMetrics } from './duplications.schema';
import { WithPagination } from 'src/tools/graphql/entitites/pagination.graphql';

@ObjectType()
export class Duplication extends DuplicationMetrics {
  @Field(() => ID)
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sonarKey: string;
}

@ObjectType()
export class PaginatedDuplicatedMetrics extends WithPagination {
  @Field(() => [Duplication], { nullable: 'items' })
  data: Duplication[];
}
