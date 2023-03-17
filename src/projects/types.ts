import { Qualifier, Visibility } from './models/projects.schema';

export interface CreateProjectsDTO {
  sonarKey: string;
  name: string;
  qualifier: Qualifier;
  isFavorite?: boolean;
  tags: [string?];
  visibility: Visibility;
  needIssuesSync?: boolean;
}
