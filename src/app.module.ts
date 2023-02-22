import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { PersistenceModule } from './persistence/persistence.module';
import * as Joi from 'joi';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NEOAUTO_URL: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot({
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
      playground: true,
    }),
    JobsModule,
    PersistenceModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
