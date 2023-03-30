import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  FacetValues,
  IssuesResponse,
  MetricResponse,
  ProjectsResponse,
  RequestPaginationsArgs,
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

  getSingleFacetsByProject(
    faceValue: FacetValues,
    projectKey: string,
    requestOptions?: RequestPaginationsArgs,
  ) {
    const { auth, paginationParams } = requestOptions ?? {};
    return this.getSingleFacets(faceValue, {
      auth,
      paginationParams: {
        ...paginationParams,
        componentKeys: projectKey,
      },
    });
  }

  getPaginatedProject(requestOptions?: RequestPaginationsArgs) {
    return this.getPaginatedData<ProjectsResponse>(
      '/components/search_projects',
      requestOptions,
    );
  }

  async getAllProjects(requestOptions?: RequestPaginationsArgs) {
    const { paginationParams, auth } = requestOptions ?? {};

    const { ps = 500, p = 1 } = paginationParams ?? {};
    const {
      paging: { total },
      components: firstProjects,
    } = await this.getPaginatedProject({
      ...requestOptions,
      paginationParams: {
        p,
        ps,
      },
    });

    const pages = Math.round(total / ps) - 1;

    const emptyIterationsArray = Array.from(Array(pages));

    const nextProjectsResponse = await Promise.all(
      emptyIterationsArray.map((_, index) =>
        this.getPaginatedProject({
          auth,
          paginationParams: {
            p: index + 2,
            ps,
          },
        }),
      ),
    );

    return firstProjects.concat(
      nextProjectsResponse.flatMap(({ components }) => components),
    );
  }

  getPaginatedIssues(requestOptions?: RequestPaginationsArgs) {
    return this.getPaginatedData<IssuesResponse>(
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
    ],
  ) {
    const { data } = await this.client.get<MetricResponse>(
      '/measures/component',
      {
        params: {
          params: {
            component: projectKey,
            metricKeys: metricKeys.join(','),
          },
        },
      },
    );
    return data.component.measures;
  }
}
