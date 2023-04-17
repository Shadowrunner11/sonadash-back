import { Field, InputType } from '@nestjs/graphql';
import { FilterItemsString } from './pagination.graphql';

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
