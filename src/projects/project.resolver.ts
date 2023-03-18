import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Project } from './models/project.graphql';
import { ProjectsService } from './projects.service';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private authorsService: ProjectsService) {}

  @Query(() => Project)
  async project(@Args('_id', { type: () => ID }) id: string) {
    return this.authorsService.findOneById(id);
  }
}
