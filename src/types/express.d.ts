// types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';
import { JwtUser } from '../models/jwt-user';


declare global {
  namespace Express {
    interface Request {
      user?: JwtUser & JwtPayload;
    }
  }
}
