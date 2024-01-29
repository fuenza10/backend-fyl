/**
 * Pagination information
 */
export type PaginationData = {
  page?: number;
  limit?: number;
};

/**
 * Proxy functions
 *
 * used to create custom methods for prisma models
 */
export type ProxyFunctions = {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		findMany: (params: unknown, pagination: PaginationData) => Promise<any>;
		count: (params: unknown) => Promise<number>;
	};
