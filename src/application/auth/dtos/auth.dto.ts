import { Request } from 'express';

export interface CreateAccountDto {
  email: string;
  password: string;
}

export class SessionData {
  sub: string;
  email?: string;
}

export interface UserRequest extends Request {
  user?: SessionData;
}
