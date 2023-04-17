import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import {
  FilterItemsString,
  WithPagination,
} from 'src/tools/graphql/entitites/pagination.graphql';
import { Author } from './author.schema';
import { CreateAuthorsDTO } from '../types';
import { CommonFilters } from 'src/tools/graphql/entitites/filters';

@ObjectType()
export class AuthorGraphql extends Author {
  @Field(() => ID)
  _id: string;
}

@ObjectType()
export class PaginatedAuthors extends WithPagination {
  @Field(() => [AuthorGraphql])
  data: AuthorGraphql[];
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

@InputType()
export class CommonFilters extends TimeStampsFilter {
  @Field(() => FilterItemsString, { nullable: true })
  _ids?: FilterItemsString;
}
@InputType()
export class AuthorInput implements CreateAuthorsDTO {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstname?: string;

  @Field({ nullable: true })
  lastname?: string;

  @Field({ nullable: true })
  squad?: string;

  @Field({ nullable: true })
  tribe?: string;

  @Field({ nullable: true })
  chapter?: string;

  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class AuthorsInput {
  @Field(() => [AuthorInput])
  authors: AuthorInput[];
}

@ObjectType()
export class AuthorUpsertRespose {
  @Field()
  success?: boolean;
}

@InputType()
export class AuthorsFilters extends CommonFilters {
  @Field(() => FilterItemsString, { nullable: true })
  email: FilterItemsString;
}
