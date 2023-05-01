import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { EphemeralProxy } from '../../application/proxy/dtos/ephemeral-proxy.response';
import { ProxyConfig } from '@prisma/client';

@Injectable()
export class ProxyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(proxy: EphemeralProxy): Promise<ProxyConfig> {
    const { expires_at, host, port } = proxy;
    return this.prisma.proxyConfig.create({
      data: {
        expiresAt: new Date(expires_at),
        host,
        port,
      },
    });
  }

  async get(): Promise<ProxyConfig> {
    const { currentTime, MINUTES, MILISECONDS } = {
      currentTime: new Date(),
      MINUTES: 20,
      MILISECONDS: 60000,
    };
    const jobTime = new Date(currentTime.getTime() + MINUTES * MILISECONDS);

    return this.prisma.proxyConfig.findFirst({
      where: {
        expiresAt: {
          gt: jobTime,
        },
      },
    });
  }
}
