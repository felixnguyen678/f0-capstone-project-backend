import {User} from '../models';

export type Credentials = {
  email: string;
  password: string;
};

export interface UserWithPassword extends User {
  password: string;
}
