export interface ErrnoException extends Error {
  errno?: number;
  code?: string | number;
  path?: string;
  syscall?: string;
  stack?: string;
  errmsg?: string;
}

export interface AggregatePayload {
  pipeline: Record<string, unknown>[];
}

export type AggregatePipeline = Record<string, unknown>[];

export enum UserRole {
  USER = 'user',
  COORDINATOR = 'coordinator',
  AGENT = 'agent',
}
