import { ArgsType, Field } from '@nestjs/graphql';
import { CursorPagination } from '../../../shared/utils/pagination/cursor-pagination';
import { IsOptional, IsString } from 'class-validator';
import { GetVehicleCondition, typeofVehicleCondition } from '../enums/vehicle.enums';

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

  @Field(typeofVehicleCondition, { nullable: true })
  @IsOptional()
  readonly condition?: GetVehicleCondition;
}
