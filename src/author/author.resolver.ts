import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Author, AuthorPagination } from './models/author.grapqhl';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorsResolver {
  constructor(private authorsService: AuthorService) {}

  @Query(() => AuthorPagination)
  async authors(
    @Args('page', { type: () => Int }) page: number,
    @Args({ name: 'limit', defaultValue: 10 }) limit?: number,
  ) {
    return this.authorsService.getPaginatedAuthors({
      page,
      limit,
    });
  }
}
