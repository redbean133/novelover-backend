import { Request } from 'express';
import { IAccessTokenPayload } from './IAccessTokenPayload';

export interface IRequestWithUser extends Request {
  user: IAccessTokenPayload;
}
