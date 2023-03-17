import { Test, TestingModule } from '@nestjs/testing';
import { SonarDataSourceService } from './sonar-data-source.service';

describe('SonarDataSourceService', () => {
  let service: SonarDataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SonarDataSourceService],
    }).compile();

    service = module.get<SonarDataSourceService>(SonarDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
