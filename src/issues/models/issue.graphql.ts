import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Issue as Issues } from './issue.schema';
import {
  FilterItemString,
  FilterItemsString,
  WithPagination,
} from 'src/tools/graphql/entitites/pagination.graphql';
import {
  TimeFilter,
  TimeStampsFilter,
} from 'src/tools/graphql/entitites/filters';

@ObjectType()
export class Issue extends Issues {
  @Field(() => ID)
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedIssues extends WithPagination {
  @Field(() => [Issue], { nullable: 'items' })
  data: Issue[];
}

@InputType()
export class IssuesFilter extends TimeStampsFilter {
  @Field(() => FilterItemsString, { nullable: true })
  _ids?: FilterItemsString;

  @Field(() => FilterItemsString, { nullable: true })
  sonarKeys?: FilterItemsString;

  @Field(() => FilterItemsString, { nullable: true })
  observations?: FilterItemsString;

  @Field(() => FilterItemsString, { nullable: true })
  developerEmails?: FilterItemsString;

  @Field({ nullable: true })
  file?: FilterItemString;

  @Field({ nullable: true })
  scope?: FilterItemString;

  @Field(() => FilterItemsString, { nullable: true })
  rules?: FilterItemsString;

  @Field(() => FilterItemsString, { nullable: true })
  projects?: FilterItemsString;

  @Field({ nullable: true })
  issueCreatedAt?: TimeFilter;

  @Field({ nullable: true })
  issuedUpdatedAt?: TimeFilter;

  @Field({ nullable: true })
  status: FilterItemString;
}
