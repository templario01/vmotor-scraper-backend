import { Field, ID, ObjectType } from '@nestjs/graphql';
import { graphqlDateReturnType } from '../../../shared/dtos/decimal-scalar';
import {
  IPaginatedResponse,
  PaginatedResponse,
} from '../../../shared/utils/pagination/cursor-pagination';

@ObjectType()
export class UserSearchEntity {
  @Field(() => ID)
  readonly uuid: string;

  @Field(graphqlDateReturnType)
  readonly createdAt: Date;

  @Field()
  readonly text: string;
}

export const typeofUserSearchEntity = () => UserSearchEntity;
export const typeofArrayUserSearcheEntity = () => [UserSearchEntity];

@ObjectType()
export class PaginatedUserSearchEntity extends PaginatedResponse(UserSearchEntity) {}
export type IPaginatedUserSearchEntity = IPaginatedResponse<UserSearchEntity>;

export const typeofPaginatedUserSearchesEntity = () => PaginatedUserSearchEntity;
