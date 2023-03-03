import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MercadolibreSyncService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(MercadolibreSyncService.name);
  }
}
