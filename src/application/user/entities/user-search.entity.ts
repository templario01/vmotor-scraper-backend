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

export const userSearchEntityReturnType = () => UserSearchEntity;
export const userSearchesEntityReturnType = () => [UserSearchEntity];

@ObjectType()
export class PaginatedUserSearchesEntity extends PaginatedResponse(UserSearchEntity) {}
export type IPaginatedUserSearchesEntity = IPaginatedResponse<UserSearchEntity>;

export const paginatedUserSearchesEntityReturnType = () => PaginatedUserSearchesEntity;
