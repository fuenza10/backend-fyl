import { users } from '@prisma/client';

export class UserServiceResponse {
  ok: boolean;

  status: number;

  user?: users;

  accessToken?: string;

  refreshToken?: string;

  error?: string;
}
