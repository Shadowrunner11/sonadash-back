import { TimeFilter } from 'src/author/models/author.grapqhl';
import type {
  FilterItemString,
  FilterItemsString,
} from 'src/tools/graphql/entitites/pagination.graphql';

export enum sonarCollections {
  ISSUES = 'issue',
  AUTHORS = 'author',
  PROJECTS = 'project',
  QUALITY_GATES = 'qualitygate',
  QUALITY_PROFILE = 'qualityprofile',
}

export interface PaginationParams {
  page: number;
  limit?: number;
}

export interface IFilters {
  [x: string]: FilterItemsString | FilterItemString | TimeFilter;
}
