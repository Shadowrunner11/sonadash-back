import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GraphqlWithTimeStamps {
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
