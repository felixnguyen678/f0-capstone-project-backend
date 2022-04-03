import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {EmailConfiguration, EmailConfigurationRelations} from '../models';

export class EmailConfigurationRepository extends DefaultCrudRepository<
  EmailConfiguration,
  typeof EmailConfiguration.prototype.id,
  EmailConfigurationRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(EmailConfiguration, dataSource);
  }
}
