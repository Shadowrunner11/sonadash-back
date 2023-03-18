import { Module } from '@nestjs/common';
import { SonarDataSourceService } from './sonar-data-source.service';

@Module({
  providers: [SonarDataSourceService],
  exports: [SonarDataSourceService],
})
export class SonarDataSourceModule {}
