import { ObjectType } from '@nestjs/graphql';
import { SyncInventoryJobEntity } from './sync-inventory-job.entity';

@ObjectType()
export class SyncBrandsJobEntity extends SyncInventoryJobEntity {}

export const syncBrandsJobEntityReturnType = () => SyncBrandsJobEntity;
