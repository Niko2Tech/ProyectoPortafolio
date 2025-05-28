import { Request } from 'express';

export interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string;
    access_token: string;
  };
}
