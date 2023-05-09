import { ArgsType } from '@nestjs/graphql';
import { CursorPagination } from '../../../shared/utils/pagination/cursor-pagination';

@ArgsType()
export class GetSearchesArgs extends CursorPagination {}
