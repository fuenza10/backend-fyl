import { users } from '@prisma/client';

export class LoginUserResponse {
  ok: boolean;

  status: number;

  user: users;

  accessToken: string;

  refreshToken: string;
}
