import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  total: number;

  @Field(() => Boolean, { nullable: true })
  hasNext?: boolean;
}

@ObjectType()
export class WithPagination {
  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

// TODO: check if there is need to put read only
@InputType()
export class BaseFilterI {
  @Field({ nullable: true })
  isExclusion?: boolean;
}

@InputType()
export class FilterItemString extends BaseFilterI {
  @Field()
  value: string;

  @Field({ defaultValue: false })
  isPartialMatch?: boolean;
}

@InputType()
export class FilterItemsString extends BaseFilterI {
  @Field(() => [String])
  values: string[];
}
