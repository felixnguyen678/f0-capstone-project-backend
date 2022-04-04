import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {EmailConfiguration} from '../models';
import {EmailConfigurationRepository} from '../repositories';

export class EmailConfigurationController {
  constructor(
    @repository(EmailConfigurationRepository)
    public emailConfigurationRepository: EmailConfigurationRepository,
  ) {}

  @post('/email-configurations')
  @response(200, {
    description: 'EmailConfiguration model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(EmailConfiguration)},
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmailConfiguration, {
            title: 'NewEmailConfiguration',
            exclude: ['id'],
          }),
        },
      },
    })
    emailConfiguration: Omit<EmailConfiguration, 'id'>,
  ): Promise<EmailConfiguration> {
    return this.emailConfigurationRepository.create(emailConfiguration);
  }

  @get('/email-configurations/count')
  @response(200, {
    description: 'EmailConfiguration model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(EmailConfiguration) where?: Where<EmailConfiguration>,
  ): Promise<Count> {
    return this.emailConfigurationRepository.count(where);
  }

  @get('/email-configurations')
  @response(200, {
    description: 'Array of EmailConfiguration model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(EmailConfiguration, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(EmailConfiguration) filter?: Filter<EmailConfiguration>,
  ): Promise<EmailConfiguration[]> {
    return this.emailConfigurationRepository.find(filter);
  }

  @patch('/email-configurations')
  @response(200, {
    description: 'EmailConfiguration PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmailConfiguration, {partial: true}),
        },
      },
    })
    emailConfiguration: EmailConfiguration,
    @param.where(EmailConfiguration) where?: Where<EmailConfiguration>,
  ): Promise<Count> {
    return this.emailConfigurationRepository.updateAll(
      emailConfiguration,
      where,
    );
  }

  @get('/email-configurations/{id}')
  @response(200, {
    description: 'EmailConfiguration model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(EmailConfiguration, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(EmailConfiguration, {exclude: 'where'})
    filter?: FilterExcludingWhere<EmailConfiguration>,
  ): Promise<EmailConfiguration> {
    return this.emailConfigurationRepository.findById(id, filter);
  }

  @patch('/email-configurations/{id}')
  @response(204, {
    description: 'EmailConfiguration PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(EmailConfiguration, {partial: true}),
        },
      },
    })
    emailConfiguration: EmailConfiguration,
  ): Promise<void> {
    await this.emailConfigurationRepository.updateById(id, emailConfiguration);
  }

  @put('/email-configurations/{id}')
  @response(204, {
    description: 'EmailConfiguration PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() emailConfiguration: EmailConfiguration,
  ): Promise<void> {
    await this.emailConfigurationRepository.replaceById(id, emailConfiguration);
  }

  @del('/email-configurations/{id}')
  @response(204, {
    description: 'EmailConfiguration DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.emailConfigurationRepository.deleteById(id);
  }
}
