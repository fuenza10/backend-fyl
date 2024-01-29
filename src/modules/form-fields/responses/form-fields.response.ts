import { formFields, forms } from '@prisma/client';

export class FormFieldsResponse {
  ok: boolean;
  status: number;

  formFields?: formFields[];
  msg?: string;
  error?: string;
  meta?: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}