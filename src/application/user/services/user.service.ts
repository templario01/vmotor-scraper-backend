import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../persistence/repositories/user.repository';
import { ToggleUserNotificationsEntity } from '../entities/toggle-user-notifications.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async toggleUserNotifications(
    userId: number,
    hasActiveNotifications: boolean,
  ): Promise<ToggleUserNotificationsEntity> {
    const result = await this.userRepository.changeUserNotifications(
      userId,
      hasActiveNotifications,
    );

    return { hasActiveNotifications: result.hasActiveNotifications };
  }
}
