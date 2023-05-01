import { ArgsType, Field } from '@nestjs/graphql';
import { CursorPagination } from '../../../shared/utils/pagination/cursor-pagination';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GetVehiclesArgs extends CursorPagination {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly searchName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly city?: string;
}
