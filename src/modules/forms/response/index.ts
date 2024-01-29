import { forms } from '@prisma/client';

export class FormsResponse {
  ok: boolean;
  status: number;
  form?: forms;
  forms?: forms[];
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
