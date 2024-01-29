import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';

import { Prisma, $Enums } from '@prisma/client';
import { IsValidRut } from 'src/common/decorators/rut-validator';
import { PASSWORDREGEX } from 'src/constants/constants';

export class RegisterUserBody implements Prisma.usersUncheckedCreateInput {
  @IsEmail()
  email: string;

  @IsString()
  @IsValidRut()
  rut: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(PASSWORDREGEX, {
    message:
      'The password must have between 8 to 20 characters, an uppercase letter, a lowercase letter, and a number.',
  })
  password: string;

  @IsEnum($Enums.RoleEnum, { each: true })
  @IsOptional()
  userRole: $Enums.RoleEnum[];

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;


  @IsString()
  @IsOptional()
  companyId?: string;
}
