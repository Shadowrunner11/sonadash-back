import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import { PaginatedProjects, Project } from './models/project.graphql';
import { ProjectsService } from './projects.service';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  @Query(() => Project)
  async project(@Args('_id', { type: () => ID }) id: string) {
    return this.projectsService.findOneById(id);
  }

  @Query(() => PaginatedProjects)
  paginatedProjects(
    @Args('page', { type: () => Int }) page: number,
    @Args({ name: 'limit', defaultValue: 10, type: () => Int }) limit?: number,
  ) {
    return this.projectsService.getPaginatedProjects({
      page,
      limit,
    });
  }
}
