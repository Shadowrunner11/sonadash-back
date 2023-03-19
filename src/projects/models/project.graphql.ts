import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Projects } from './projects.schema';

@ObjectType()
export class Project extends Projects {
  @Field(() => ID)
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
