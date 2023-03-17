import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosBasicCredentials, AxiosInstance } from 'axios';
import { IssuesResponse, ProjectsResponse } from './types';

const defaultSonarAPI_URL = 'https://sonarqube.innovacionpacifico.com/api';

interface PaginationParams {
  p?: number;
  ps?: number;
}

interface RequestPaginationsArgs {
  paginationParams?: PaginationParams;
  auth?: AxiosBasicCredentials;
}

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

  async getAllIssues(requestOptions?: RequestPaginationsArgs) {
    const { paginationParams, auth } = requestOptions ?? {};

    const { ps = 500, p = 1 } = paginationParams ?? {};
    const {
      paging: { total },
      issues: firstIssues,
    } = await this.getPaginatedIssues({
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
        this.getPaginatedIssues({
          auth,
          paginationParams: {
            p: index + 2,
            ps,
          },
        }),
      ),
    );

    return firstIssues.concat(
      nextProjectsResponse.flatMap(({ issues }) => issues),
    );
  }
}
