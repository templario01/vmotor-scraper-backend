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
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from './sentry/sentry.module';

@Module({
  imports: [
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: parseInt(process.env.SENTRY_TRACE_RATE),
      environment: process.env.NODE_ENV,
    }),
    LoggerModule.forRoot(),
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
      formatResponse: (response, requestContext) => {
        if (response.errors) {
          const http = {
            ...requestContext.response.http,
            status: 400,
          };

          return { ...response, http };
        }
        return response;
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
