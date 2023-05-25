import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SyncInventoryDto {
  @Expose()
  readonly jobs_started_at: Date;
}
