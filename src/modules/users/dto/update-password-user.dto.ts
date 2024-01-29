import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORDREGEX } from 'src/constants/constants';

export class UpdatePasswordDto {
  // @IsNotEmpty()
  // @IsString()
  // oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  // @Matches(PASSWORDREGEX, {
  //   message:
  //     'The password must have a Uppercase, lowercase letter and a number',
  // })
  newPassword: string;
}
