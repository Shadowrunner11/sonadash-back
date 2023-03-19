import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { WithPagination } from 'src/tools/graphql/entitites/pagination.graphql';

@ObjectType()
export class Author {
  @Field(() => ID)
  _id: string;

  @Field()
  email: string;
}

@ObjectType()
export class PaginatedAuthors extends WithPagination {
  @Field(() => [Author])
  data: Author[];
}

@InputType()
export class TimeFilter {
  @Field({ nullable: true })
  beforeDate?: Date;

  @Field({ nullable: true })
  afterDate?: Date;
}

@InputType()
export class TimeStampsFilter {
  @Field({ nullable: true })
  createdAtFilter: TimeFilter;

  @Field({ nullable: true })
  updatedAtFilter: TimeFilter;
}
