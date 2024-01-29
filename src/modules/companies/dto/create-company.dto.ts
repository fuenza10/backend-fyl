import { Prisma } from '@prisma/client';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidRut } from 'src/common/decorators/rut-validator';
export class CreateCompanyDto implements Prisma.companiesCreateInput {
  @IsNotEmpty()
  @IsValidRut()
  rut: string;

  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  state?: boolean;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
