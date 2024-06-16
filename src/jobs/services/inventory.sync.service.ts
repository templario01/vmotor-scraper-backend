import { Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '../../config/env-config.service';
import { Environment } from '../../config/dtos/config.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getDurationTime } from '../../shared/utils/time.utils';
import { ProxyService } from '../../application/proxy/proxy.service';
import { getLaunchOptions } from '../../shared/utils/puppeter.utils';
import * as puppeteer from 'puppeteer';
import { Browser as PuppeteerBrowser } from 'puppeteer';
import { AutocosmosSyncService } from '../autocosmos/autocosmos-sync.service';
import { AutocosmosCondition } from '../autocosmos/enums/autocosmos.enum';
import { NeoAutoSyncService } from '../neoauto/neoauto-sync.service';
import { MercadolibreSyncService } from '../mercadolibre/mercadolibre-sync.service';
import { NeoautoCondition } from '../neoauto/enums/neoauto.enums';

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);
  constructor(
    private readonly envConfigService: EnvConfigService,
    private readonly neoautoSyncService: NeoAutoSyncService,
    private readonly mercadolibreSyncService: MercadolibreSyncService,
    private readonly autocosmosSyncService: AutocosmosSyncService,
    private readonly proxyService: ProxyService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async syncAllInventory(): Promise<void> {
    const startTime = new Date();
    let proxyIP: string;
    const { environment } = this.envConfigService.app();
    if (environment !== Environment.DEV && environment !== Environment.TEST) {
      const proxy = await this.proxyService.getProxy();
      if (proxy) {
        const { host, port } = proxy;
        proxyIP = `${host}:${port}`;
      }
    }
    const proxyServer = proxyIP ? [`'--proxy-server=${proxyIP}`] : [];
    const options = getLaunchOptions(environment, proxyServer);

    const browser: PuppeteerBrowser = await puppeteer.launch(options);

    await Promise.all([
      this.neoautoSyncService.syncAll(browser, NeoautoCondition.NEW),
      this.neoautoSyncService.syncAll(browser, NeoautoCondition.USED),
      this.autocosmosSyncService.syncAll(browser, AutocosmosCondition.NEW),
      this.autocosmosSyncService.syncAll(browser, AutocosmosCondition.USED),
      this.mercadolibreSyncService.syncAll(browser),
    ]);
    await browser.close();

    const endTime = new Date();
    const duration = getDurationTime(startTime, endTime);

    this.logger.log(`All inventory synced successfully, duration: ${duration}`);
  }
}
