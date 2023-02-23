import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '../../config/env-config.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cron, CronExpression } from '@nestjs/schedule';
import { NeoautoVehicleConditionEnum } from '../../application/vehicles/dtos/enums/vehicle.enums';
import { VehicleSyncDto } from '../../application/vehicles/dtos/requests/neoauto.dto';
import { WebsiteRepository } from '../../persistence/repositories/website.repository';
import {
  getVehicleInfoByNeoauto,
  parsePrice,
} from '../../shared/utils/neoauto.utils';
import { plainToInstance } from 'class-transformer';
import { BrandsRepository } from '../../persistence/repositories/brands.repository';
import { ModelsRepository } from '../../persistence/repositories/models.repository';
import { VehicleRepository } from '../../persistence/repositories/vehicle.repository';
import { CreateVehicleDto } from '../../application/vehicles/dtos/requests/create-vehicle.dto';
import {
  HTML_QUERY_DESCRIPTION,
  HTML_QUERY_IMAGE,
  HTML_QUERY_MOTOR,
  HTML_QUERY_TRANSMISSION,
  HTML_QUERY_YEAR,
  HTML_VEHICLE_VIEW,
} from '../../application/vehicles/constants/neoauto.constants';
import { SyncNeoautoPageParams } from '../../application/vehicles/dtos/requests/neoauto-sync.dto';

@Injectable()
export class NeoAutoSyncService {
  private readonly logger: Logger;
  private readonly NEOAUTO_URL: string;
  constructor(
    private readonly config: EnvConfigService,
    private readonly websiteRepository: WebsiteRepository,
    private readonly brandRepository: BrandsRepository,
    private readonly modelRepository: ModelsRepository,
    private readonly vehicleRepository: VehicleRepository,
  ) {
    this.logger = new Logger(NeoAutoSyncService.name);
    this.NEOAUTO_URL = this.config.neoauto().url;
  }

  @Cron('0 2 * * 1')
  async syncNewCars(): Promise<void> {
    const vehicleCondition = NeoautoVehicleConditionEnum.NEW;
    const hostname = new URL(this.NEOAUTO_URL).hostname;
    const [name] = hostname.split('.');

    const currentWebsite = await this.websiteRepository.findByName(name);
    const currentPages = await this.getPages(vehicleCondition);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let index = 1; index <= currentPages; index++) {
      await page.goto(
        `${this.NEOAUTO_URL}/venta-de-autos-${vehicleCondition}?page=${index}`,
        { timeout: 0 },
      );

      const html = await page.content();
      const $ = cheerio.load(html);

      const vehicleBlock = $('.c-results-concessionaire');

      for (let i = 0; i < vehicleBlock.length; i++) {
        const element = vehicleBlock[i];
        const price =
          $(element)
            .find(
              'div.c-results-concessionaire-content div.c-results-concessionaire__contact ' +
                'p.c-results-concessionaire__price strong.c-results-concessionaire__price--black',
            )
            .html() || 'consultar';

        if (!price.toLowerCase().includes('consultar')) {
          await this.syncInfoForNewVehicle({
            browser,
            cheerioInstance$: $,
            mainHtml: element,
            websiteId: currentWebsite.id,
          });
        }
      }
    }

    await browser.close();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncUsedCars(): Promise<void> {
    console.log('implement method');
  }

  async syncInfoForNewVehicle(params: SyncNeoautoPageParams): Promise<void> {
    const { browser, cheerioInstance$, mainHtml, websiteId } = params;
    const frontImage = cheerioInstance$(mainHtml)
      .find(HTML_QUERY_IMAGE)
      .attr('src');
    const vehicleURL = cheerioInstance$(mainHtml)
      .find('a.c-results-concessionaire__link')
      .attr('href');

    const { brand, model, id } = getVehicleInfoByNeoauto(vehicleURL);

    const vehiclePage = await browser.newPage();
    await vehiclePage.goto(`${this.NEOAUTO_URL}/${vehicleURL}`, {
      timeout: 0,
    });
    await vehiclePage.waitForSelector(HTML_VEHICLE_VIEW);
    const vehicleHtml = await vehiclePage.content();
    const $vehicle = cheerio.load(vehicleHtml);

    const vehicleDescription = $vehicle(HTML_QUERY_DESCRIPTION);
    const vehicleYear = $vehicle(HTML_QUERY_YEAR);
    const vehiclePrice = vehicleYear.parent().next().find('strong');
    const speeds = $vehicle(HTML_QUERY_TRANSMISSION).next();
    const transmission = $vehicle(HTML_QUERY_TRANSMISSION).next().next();
    const doors = $vehicle(HTML_QUERY_TRANSMISSION).next().next().next();
    const engineType = $vehicle(HTML_QUERY_MOTOR);
    const engineFuelType = $vehicle(HTML_QUERY_MOTOR).nextAll().eq(3);
    const enginePowerRpm = $vehicle(HTML_QUERY_MOTOR).nextAll().eq(4);
    const enginePowerHp = $vehicle(HTML_QUERY_MOTOR).nextAll().eq(5);

    const { id: brandId } = await this.brandRepository.findByName(brand);
    const { id: modelId } = await this.modelRepository.findByNameAndBrandId(
      model,
      brandId,
    );

    const vehicleInfo = plainToInstance(CreateVehicleDto, {
      vehicle: plainToInstance(VehicleSyncDto, {
        mileage: 0,
        externalId: id,
        frontImage: frontImage.trim(),
        url: `${this.NEOAUTO_URL}/${vehicleURL.trim()}`,
        usdPrice: parsePrice(vehiclePrice.html()),
        description: vehicleDescription.html(),
        transmission: transmission.html(),
        engineType: engineType.html(),
        engineFuelType: engineFuelType.html(),
        enginePowerRpm: enginePowerRpm.html(),
        enginePowerHp: enginePowerHp.html(),
        year: Number(vehicleYear.html()) || undefined,
        speeds: Number(speeds.html()) || undefined,
        doors: Number(doors.html()) || undefined,
      }),
      brandId,
      modelId,
      websiteId,
    });

    const newVehicle = await this.vehicleRepository.upsert(vehicleInfo);

    if (newVehicle) {
      this.logger.verbose(`New vehicle synced: ${newVehicle?.description}`);
    }
  }

  async getPages(condition: string): Promise<number> {
    let pages = 1;
    const NEOAUTO_URL = this.config.neoauto().url;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    while (true) {
      await page.goto(
        `${NEOAUTO_URL}/venta-de-autos-${condition}?page=${pages}`,
        { timeout: 0 },
      );

      const html = await page.content();
      const $ = cheerio.load(html);
      const cards = $(
        '.c-results-concessionaire div.c-results-concessionaire-content',
      );

      if (cards.html() === null) break;

      pages++;
    }

    await browser.close();

    return pages - 1;
  }
}
