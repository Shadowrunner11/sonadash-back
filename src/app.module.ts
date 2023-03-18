import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsModule } from './cats/cats.module';
import { IssuesModule } from './issues/issues.module';
import { SonarDataSourceModule } from './sonar-data-source/sonar-data-source.module';
import { ProjectsModule } from './projects/projects.module';

enum envProps {
  MONGO_URI = 'MONGODB_URI',
}
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.getOrThrow<string>(envProps.MONGO_URI),
      }),
    }),
    CatsModule,
    IssuesModule,
    ProjectsModule,
    SonarDataSourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
