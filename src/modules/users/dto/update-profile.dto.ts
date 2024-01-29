import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  readonly rut?: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsBoolean()
  @IsOptional()
  isFirsLogin?: boolean;
   
}
