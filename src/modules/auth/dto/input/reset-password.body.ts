import { IsString } from 'class-validator';

export class ResetPasswordBody {
  @IsString()
  token: string;

  @IsString()
  password: string;
}
