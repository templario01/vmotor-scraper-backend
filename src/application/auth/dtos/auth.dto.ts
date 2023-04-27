import { Request } from 'express';

export interface CreateAccountDto {
  readonly email: string;
  readonly password: string;
}

export interface SessionData {
  readonly sub: number;
  readonly iat: number;
  readonly exp: number;
  readonly username: string;
}

export interface UserRequest extends Request {
  user?: SessionData;
}

export interface NotifyEmailDto {
  readonly email: string;
  readonly code: string;
  readonly expirationTime: Date;
}
