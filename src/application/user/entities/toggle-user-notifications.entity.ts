import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ToggleUserNotificationsEntity {
  @Field()
  readonly hasActiveNotifications: boolean;
}

export const toggleUserNotificationsReturnType = () => ToggleUserNotificationsEntity;
