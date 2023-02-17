import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NeoAutoSyncService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(NeoAutoSyncService.name);
  }
}
