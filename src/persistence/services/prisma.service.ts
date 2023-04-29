import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ log: process.env.NODE_ENV !== 'test' ? ['query', 'info'] : [] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async clearDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      const tableNames = await this.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='test' and tablename NOT IN ('_prisma_migrations',
      'spatial_ref_sys')`;

      const tablesToTruncate = tableNames.map(({ tablename }) => `"test"."${tablename}"`);

      try {
        await this.$executeRawUnsafe(`TRUNCATE TABLE ${tablesToTruncate};`);
      } catch (error) {
        this.logger.error({ error, message: 'fail to truncate tables}' });
      }
    }
  }
}
