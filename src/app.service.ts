import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios, { AxiosInstance } from 'axios';

@Injectable()
export class AppService {
  private axiosClient: AxiosInstance;
  constructor(private configService: ConfigService) {
    const token = this.configService.getOrThrow<string>('SONAR_TOKEN');
    const baseURL = this.configService.get<string>('SONAR_API_URL');
    this.axiosClient = Axios.create({
      baseURL,
      auth: {
        username: token,
        password: '',
      },
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  async postData(): Promise<Record<string, unknown>> {
    const { data } = await this.axiosClient.get('/components/search_projects');
    return {
      data,
    };
  }
}
