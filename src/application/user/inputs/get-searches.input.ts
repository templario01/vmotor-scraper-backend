import { ArgsType } from '@nestjs/graphql';
import { CursorPagination } from '../../../shared/utils/pagination/cursor-pagination';

@ArgsType()
export class GetUserSearchArgs extends CursorPagination {}

@ArgsType()
export class GetFavoriteVehiclesArgs extends CursorPagination {}
