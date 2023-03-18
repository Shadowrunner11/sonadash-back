import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field(() => ID)
  _id: string;

  @Field()
  email: string;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasNext: boolean;
}

@ObjectType()
export class AuthorPagination {
  @Field(() => [Author])
  data: Author[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
