import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Projects } from './projects.schema';
import { WithPagination } from 'src/tools/graphql/entitites/pagination.graphql';

@ObjectType()
export class Project extends Projects {
  @Field(() => ID)
  _id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedProjects extends WithPagination {
  @Field(() => [Project], { nullable: 'items' })
  data: Project[];
}
