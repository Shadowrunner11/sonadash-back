import { Qualifier, Visibility } from 'src/sonar-data-source/types';

export interface CreateProjectsDTO {
  sonarKey: string;
  name: string;
  qualifier: Qualifier;
  isFavorite?: boolean;
  tags: string[];
  visibility: Visibility;
  needIssuesSync?: boolean;
}
