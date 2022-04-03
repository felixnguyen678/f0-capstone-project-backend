import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserNotification, UserNotificationRelations} from '../models';

export class UserNotificationRepository extends DefaultCrudRepository<
  UserNotification,
  typeof UserNotification.prototype.id,
  UserNotificationRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(UserNotification, dataSource);
  }
}
