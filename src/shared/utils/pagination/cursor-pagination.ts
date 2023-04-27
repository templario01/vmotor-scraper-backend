import { Type } from '@nestjs/common';
import { Field, Int, ObjectType, ArgsType } from '@nestjs/graphql';

export class ICursorPagination {
  take?: number;
  after?: string;
}

@ArgsType()
export class CursorPagination implements ICursorPagination {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  take?: number;

  @Field(() => String, { nullable: true })
  after?: string;
}
export interface IEdgeType<T> {
  cursor: string;
  node: T;
}
export interface IPaginatedResponse<T> {
  edges: IEdgeType<T>[];
  nodes: T[];
  hasNextPage: boolean;
  endCursor?: string;
  totalCount: number;
}

export function PaginatedResponse<T>(classRef: Type<T>): any {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType implements IEdgeType<T> {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedResponse<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;

    @Field({ nullable: true })
    endCursor?: string;
  }
  return PaginatedType;
}
