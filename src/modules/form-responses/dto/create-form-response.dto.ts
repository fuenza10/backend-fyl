import { Prisma } from '@prisma/client';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

interface Response {
  questionId: string;
  value: string|number|boolean;
}
interface ResponseForm {
  formId: string;
  companyId: string;

  responses: Response[] ;
}
export class CreateFormResponseDto implements ResponseForm
  
{
  @IsNotEmpty()
  @IsArray()
  responses: Response[];


  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsString()
  formId: string;
}
