import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  FacetValues,
  IssueSnippet,
  IssuesPaginationParams,
  IssuesResponse,
  LanguagesResponse,
  MetricResponse,
  ProjectsResponse,
  QualityProfilesResponse,
  RequestPaginationsArgs,
  RequestRulesPaginationParams,
  RulesResponse,
} from './types';

const defaultSonarAPI_URL = 'https://sonarqube.innovacionpacifico.com/api';

// TODO: what the h..., axios should be a dependency injection, we are violating IoC

@Injectable()
export class SonarDataSourceService {
  private client: AxiosInstance;
  constructor(private configuration: ConfigService) {
    this.client = axios.create({
      baseURL: this.configuration.get<string>(
        'SONAR_API_URL',
        defaultSonarAPI_URL,
      ),
      auth: {
        username: this.configuration.get<string>('SONAR_TOKEN', ''),
        password: this.configuration.get<string>('PASSWORD', ''),
      },
    });
  }

  async getPaginatedData<T = unknown>(
    url: string,
    requestOptions?: RequestPaginationsArgs,
  ) {
    const { paginationParams: params, auth } = requestOptions ?? {};
    const { data } = await this.client.get<T>(url, {
      params,
      auth,
    });

    return data;
  }

  async getSingleFacets(
    facetValue: FacetValues,
    requestOptions?: RequestPaginationsArgs,
  ) {
    const { auth, paginationParams } = requestOptions ?? {};

    const { facets } = await this.getPaginatedIssues({
      auth,
      paginationParams: {
        ...paginationParams,
        facets: facetValue,
      },
    });

    return facets.find(({ property }) => property === facetValue)?.values;
  }

  async getSingleFacetsByProject(
    faceValue: FacetValues,
    projectKey: string,
    requestOptions?: RequestPaginationsArgs,
  ) {
    const { auth, paginationParams } = requestOptions ?? {};
    const data = await this.getSingleFacets(faceValue, {
      auth,
      paginationParams: {
        ...paginationParams,
        componentKeys: projectKey,
      },
    });

    this.throwIfLimitSurpassed(data?.length ?? 0);

    return data ?? [];
  }

  private throwIfLimitSurpassed(length: number) {
    if (length > 100) throw new Error('Facet limit surpassed');
  }

  getPaginatedProject(requestOptions?: RequestPaginationsArgs) {
    return this.getPaginatedData<ProjectsResponse>(
      '/components/search_projects',
      requestOptions,
    );
  }

  async getAllProjects(requestOptions?: RequestPaginationsArgs) {
    const { paginationParams, auth } = requestOptions ?? {};

    const { ps = 500, p = 1, f = 'analysisDate' } = paginationParams ?? {};
    const {
      paging: { total },
      components: firstProjects,
    } = await this.getPaginatedProject({
      ...requestOptions,
      paginationParams: {
        p,
        ps,
        f,
      },
    });

    const pages = Math.round(total / ps);

    const emptyIterationsArray = Array.from({ length: pages });

    const nextProjectsResponse = await Promise.all(
      emptyIterationsArray.map((_, index) =>
        this.getPaginatedProject({
          auth,
          paginationParams: {
            p: index + 2,
            ps,
            f,
          },
        }),
      ),
    );

    return firstProjects.concat(
      nextProjectsResponse.flatMap(({ components }) => components),
    );
  }

  async getPaginatedIssues(
    requestOptions?: RequestPaginationsArgs<IssuesPaginationParams>,
  ) {
    return await this.getPaginatedData<IssuesResponse>(
      '/issues/search',
      requestOptions,
    );
  }

  async getMetricByProject(
    projectKey: string,
    metricKeys = [
      'coverage',
      'lines_to_cover',
      'uncovered_lines',
      'line_coverage',
      'conditions_to_cover',
      'uncovered_conditions',
      'branch_coverage',
      'duplicated_lines',
      'duplicated_lines_density',
      'duplicated_blocks',
      'duplicated_files',
      'ncloc',
      'lines',
    ],
  ) {
    const { data } = await this.client.get<MetricResponse>(
      '/measures/component',
      {
        params: {
          component: projectKey,
          metricKeys: metricKeys.join(','),
        },
      },
    );
    return data.component.measures;
  }

  async getRules({
    auth,
    paginationParams,
  }: RequestPaginationsArgs<RequestRulesPaginationParams>) {
    const { data } = await this.client.get<RulesResponse>('/rules/search', {
      params: paginationParams,
      auth,
    });

    return data;
  }

  async getChangelog({ auth, paginationParams }: RequestPaginationsArgs) {
    const { data } = await this.client.get('/changelog', {
      auth,
      params: paginationParams,
    });

    return data;
  }

  async getLanguages({ auth, paginationParams }: RequestPaginationsArgs) {
    const { data } = await this.client.get<LanguagesResponse>(
      '/languages/list',
      {
        auth,
        params: paginationParams,
      },
    );

    return data;
  }

  async getQualityProfiles({ auth, paginationParams }: RequestPaginationsArgs) {
    const { data } = await this.client.get<QualityProfilesResponse>(
      '/qualityprofiles/search',
      {
        auth,
        params: paginationParams,
      },
    );

    return data;
  }

  async getCommitInfoByIssueKey(issueKey: string) {
    const { data } = await this.client.get<{ [key: string]: IssueSnippet }>(
      '/sources/issue_snippets',
      {
        params: {
          issueKey,
        },
      },
    );

    return data;
  }
}
