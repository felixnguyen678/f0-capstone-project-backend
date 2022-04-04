import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasManyThroughRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Notification, UserNotification} from '../models';
import {UserNotificationRepository} from './user-notification.repository';
import {NotificationRepository} from './notification.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly notifications: HasManyThroughRepositoryFactory<
    Notification,
    typeof Notification.prototype.id,
    UserNotification,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserNotificationRepository')
    protected userNotificationRepositoryGetter: Getter<UserNotificationRepository>,
    @repository.getter('NotificationRepository')
    protected notificationRepositoryGetter: Getter<NotificationRepository>,
  ) {
    super(User, dataSource);
    this.notifications = this.createHasManyThroughRepositoryFactoryFor(
      'notifications',
      notificationRepositoryGetter,
      userNotificationRepositoryGetter,
    );
    this.registerInclusionResolver(
      'notifications',
      this.notifications.inclusionResolver,
    );
  }
}
