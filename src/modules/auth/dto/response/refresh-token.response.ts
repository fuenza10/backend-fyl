import { UserDto } from '../../../users/dto/user.dto';

export class RefreshTokenResponse {
  user: UserDto;

  accessToken: string;
}
