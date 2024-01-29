import { users } from '@prisma/client';
export class RegisterUserResponse {
  ok: boolean;
  status: number;

  user: users;

  token: string;

  refreshToken: string;
}
