import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IssuesModule } from './issues/issues.module';
import { SonarDataSourceModule } from './sonar-data-source/sonar-data-source.module';
import { ProjectsModule } from './projects/projects.module';
import { QueueModule } from './queue/queue.module';
import { AuthorModule } from './author/author.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { SupabaseModule } from './supabase/supabase.module';
import { RulesModule } from './rules/rules.module';

enum envProps {
  MONGO_URI = 'MONGODB_URI',
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.getOrThrow<string>(envProps.MONGO_URI),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      introspection: !process.env.IS_DISABLED_INTROSPECTION,
      csrfPrevention: true,
    }),
    IssuesModule,
    ProjectsModule,
    SonarDataSourceModule,
    AuthorModule,
    QueueModule,
    SupabaseModule,
    RulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static port: number;
  constructor(private config: ConfigService) {
    AppModule.port = this.config.get<number>('PORT', 3000);
  }
}
