import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { PersistenceModule } from './persistence/persistence.module';
import * as Joi from 'joi';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApiModule } from './api/api.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { EnvVariablesConfig, envVariablesConfig } from './config/validator/env-variables';
import { SentryModule } from './sentry/sentry.module';
import { GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: parseInt(process.env.SENTRY_TRACE_RATE),
      environment: process.env.NODE_ENV,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object<EnvVariablesConfig>(envVariablesConfig),
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      persistedQueries: false,
      driver: ApolloDriver,
      sortSchema: true,
      introspection: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res, payload, connection }) => ({
        req,
        res,
        payload,
        connection,
      }),
      formatError: (error: GraphQLFormattedError) => {
        return {
          message: error.message,
          enxtensions: {
            status: error.extensions.status,
            originalError: error.extensions.originalError,
          },
        };
      },
      playground: true,
    }),
    JobsModule,
    PersistenceModule,
    ApiModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
