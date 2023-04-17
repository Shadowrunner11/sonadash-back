import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import {
  AuthorGraphql,
  AuthorUpsertRespose as AuthorUpsertResponse,
  AuthorsInput,
  PaginatedAuthors,
} from './models/author.grapqhl';
import { AuthorService } from './author.service';

@Resolver(() => AuthorGraphql)
export class AuthorsResolver {
  constructor(private authorsService: AuthorService) {}

  @Query(() => PaginatedAuthors)
  async paginatedAuthors(
    @Args('page', { type: () => Int }) page: number,
    @Args({ name: 'limit', defaultValue: 10 }) limit?: number,
  ) {
    return this.authorsService.getPaginatedAuthors({
      page,
      limit,
    });
  }

  @Mutation(() => AuthorUpsertResponse)
  async upsertAuthor(
    @Args('input', { type: () => AuthorsInput }) { authors }: AuthorsInput,
  ) {
    await this.authorsService.bulkUpsertAuthors(authors);

    return {
      success: true,
    };
  }
}
