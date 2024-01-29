import { companies } from "@prisma/client";

export class CompanyResponse {
    ok: boolean;
    status: number;
    company?: companies;
    companies?: companies[];
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