import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';

export const GQL_PATH = '/graphql';

export const headerWithBearerAuthorizationToken = {
  authorization:
    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkFBM0U3N0Y3Njk3QTIwNDgxRjc1OEE2NzFBNDc0QUM0ODBFQTc1NUMiLCJ4NXQiOiJxajUzOTJsNklFZ2ZkWXBuR2tkS3hJRHFkVncifQ.eyJpc3MiOiJodHRwczovL3lhcGVkZXYuYjJjbG9naW4uY29tLzUzZjhhYjMwLWY3ODctNDhhZS1iODEwLWM2MGQxOWI4NTRiYS92Mi4wLyIsImV4cCI6MTY0MjQzMTI2NywibmJmIjoxNjQyNDMwNzg3LCJhdWQiOiI2ODg2ZDRhOC1kZDYwLTQwNjItYjI4Mi1iYTQ5NGYyZmUzNjYiLCJzdWIiOiJqZWFudmFyZ2FzQG1haWxpbmF0b3IuY29tIiwiaWRZYXBlQWNjb3VudCI6IjE1OGJlM2NjOTBjMDU5MjQ4NTgzYmNmMGUwMTVmZmEwIiwiZGV2aWNlVXVpZCI6IkI3RjQ4RkYzLUQ5RkEtNEM5NS05NjdELUEyNkNENjcyODE2NiIsImF1dGhSZXN1bHQiOiJhdXRob3JpemVkIiwic3RhdHVzIjoiQUNUSVZFIiwiZnVsbE5hbWUiOiJKRUFOIFZBUkdBUyBDVUVUTyIsInN0ZXAiOiJCMkNfMUFfeWFwZV9wZXJzb25hc19sb2dpbl9tb2JpbGUiLCJlcnJvckNvZGUiOiJub25lIiwiYXpwIjoiNjg4NmQ0YTgtZGQ2MC00MDYyLWIyODItYmE0OTRmMmZlMzY2IiwidmVyIjoiMS4wIiwiaWF0IjoxNjQyNDMwNzg3fQ.QnNG49RRFTPDyXqqwzNbQCH3MJ7rxpWzQJf2TLMojJ9r6C6egneKPTHRbNS6aEOxg4ayjAn3NRtGLe3Cng96bYE_DF3JQSKZPeVhzZSu0ScWFU_iE7dUrqm2AheoJrnSMckQtWBWgg5Hn35jIL8wUoOBWlQluEXv81P33bVWsb0LGK25LH29nMoio-N0hptyzV9cnIKFTsV_I-ND9NpxFivygnuuPeCzPXzwr2WRAAGaxPhsCW9Qugjqwbk5P0UII-iT9o6zbcP9O_EVHIyxgSmHravweCQI-4kSInALES3qdBaOak67TJQKiR4yofiTFiXeBHETzvcKamN1mQhkog',
};

export const fakeRequestId = 'ffa04d27-6fa0-46ea-ad3a-82632ee14d1a';

export const doRequestToGraphqlServer = (body: object) => {
  return request(global.testApp.getHttpServer())
    .post(GQL_PATH)
    .set('Authorization', headerWithBearerAuthorizationToken.authorization)
    .set('Request-ID', fakeRequestId)
    .set('x-request-id', fakeRequestId)
    .send(body);
};

export const configureTestApplicationForSuccessScenarios = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  moduleFixture.useLogger(false);

  const testApp = moduleFixture.createNestApplication();

  testApp.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));

  return testApp;
};
