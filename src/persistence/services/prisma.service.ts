import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async clearDatabase(): Promise<number[]> {
    if (process.env.APP_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

      return Promise.all(
        models.map((modelKey) => {
          const varName =
            modelKey.toString().charAt(0).toUpperCase() + modelKey.toString().slice(1);
          return this.$executeRaw`TRUNCATE test."${varName}" CASCADE;`;
        }),
      );
    }
  }
}
