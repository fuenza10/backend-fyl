import { Prisma } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { CreateOptionDto } from './create-options.dto';
import { Type } from 'class-transformer';

export class CreateFormFieldDto implements Partial <Prisma.formFieldsCreateInput> {
    @IsNotEmpty()
    @IsString()
    label: string;
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsString()
    type: string;
    @IsOptional()
    @IsString()
    state?: boolean;
    
    @IsNotEmpty()
    @IsString()
    formId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOptionDto)
    optionsData?: string[];
}