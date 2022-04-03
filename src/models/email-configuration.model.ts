import {Entity, model, property} from '@loopback/repository';

@model()
export class EmailConfiguration extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  senderName: string;

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
  senderEmail: string;

  @property({
    type: 'string',
    required: true,
  })
  subject: string;

  @property({
    type: 'boolean',
    default: true,
  })
  enabled?: boolean;

  @property({
    type: 'string',
    required: true,
  })
  message: string;

  constructor(data?: Partial<EmailConfiguration>) {
    super(data);
  }
}

export interface EmailConfigurationRelations {
  // describe navigational properties here
}

export type EmailConfigurationWithRelations = EmailConfiguration &
  EmailConfigurationRelations;
