import { Exclude, Expose, Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsString } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { users as User } from '@prisma/client';
// import { Role } from 'src/modules/auth/enums';

@Exclude()
export class UserDto {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  @Transform(({ value }) => value.toString(), { toPlainOnly: true }) // Transformar ObjectId a cadena
  readonly id?: string;

  @Expose()
  @IsEmail()
  readonly email: string;

  @Expose()
  @IsString()
  readonly nombre: string;

  @Expose()
  @IsBoolean()
  readonly estado: boolean;


}
