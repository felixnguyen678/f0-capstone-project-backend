import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {User, UserNotification, Notification} from '../models';
import {UserRepository} from '../repositories';

export class UserNotificationController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  @get('/users/{id}/notifications', {
    responses: {
      '200': {
        description:
          'Array of User has many Notification through UserNotification',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Notification)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Notification>,
  ): Promise<Notification[]> {
    return this.userRepository.notifications(id).find(filter);
  }

  @post('/users/{id}/notifications', {
    responses: {
      '200': {
        description: 'create a Notification model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Notification)},
        },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {
            title: 'NewNotificationInUser',
            exclude: ['id'],
          }),
        },
      },
    })
    notification: Omit<Notification, 'id'>,
  ): Promise<Notification> {
    return this.userRepository.notifications(id).create(notification);
  }

  @patch('/users/{id}/notifications', {
    responses: {
      '200': {
        description: 'User.Notification PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Notification, {partial: true}),
        },
      },
    })
    notification: Partial<Notification>,
    @param.query.object('where', getWhereSchemaFor(Notification))
    where?: Where<Notification>,
  ): Promise<Count> {
    return this.userRepository.notifications(id).patch(notification, where);
  }

  @del('/users/{id}/notifications', {
    responses: {
      '200': {
        description: 'User.Notification DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Notification))
    where?: Where<Notification>,
  ): Promise<Count> {
    return this.userRepository.notifications(id).delete(where);
  }
}
