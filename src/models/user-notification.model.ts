import {Entity, model, property} from '@loopback/repository';

@model()
export class UserNotification extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  notificationId: string;

  constructor(data?: Partial<UserNotification>) {
    super(data);
  }
}

export interface UserNotificationRelations {
  // describe navigational properties here
}

export type UserNotificationWithRelations = UserNotification &
  UserNotificationRelations;
