import { PartialType } from '@nestjs/mapped-types';
import { CreateFormResponseDto } from './create-form-response.dto';

import { IsNotEmpty, IsString } from 'class-validator';
import {  responses } from '@prisma/client';

interface formResponse {
    value: string

    questionId: string
    formResponseId: string
    
}
export class UpdateFormResponseDto extends PartialType(CreateFormResponseDto) {

    @IsString()
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    formResponse: formResponse[]

}