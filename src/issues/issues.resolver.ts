import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import { Issue, IssuesFilter, PaginatedIssues } from './models/issue.graphql';
import { IssuesService } from './issues.service';

@Resolver(() => Issue)
export class IssuesResolver {
  constructor(private issuesService: IssuesService) {}

  @Query(() => Issue)
  issue(@Args('_id', { type: () => ID }) id: string) {
    return this.issuesService.findById(id);
  }

  @Query(() => PaginatedIssues)
  paginatedIssues(
    @Args('page', { type: () => Int }) page: number,
    @Args({ name: 'limit', defaultValue: 10, type: () => Int }) limit?: number,
    @Args('filter', { type: () => IssuesFilter, nullable: true })
    filter?: IssuesFilter,
  ) {
    return this.issuesService.getPaginatedIssues(
      {
        page,
        limit,
      },
      filter,
    );
  }
}
