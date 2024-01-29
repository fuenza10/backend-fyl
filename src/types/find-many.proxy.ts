// find-many.proxy.ts
// import { Paginated } from '../paginated';
type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };

};
import { PaginationData, ProxyFunctions } from './types';

/**
 * FindManyPaginated
 *
 * type of the findManyPaginated method
 */
export type FindManyPaginated<F extends ProxyFunctions> = {
  findManyPaginated: (
    data?: Omit<Parameters<F['findMany']>[0], 'take' | 'skip'>,
    pagination?: PaginationData,
  ) => Promise<Paginated<Awaited<ReturnType<F['findMany']>>[0]>>;
};

/**
 * makeFindManyPaginated
 *
 * factory function that creates the findManyPaginated method.
 * this method is used to paginate the results of a findMany method.
 * this method implements js proxy to intercept the call to findMany and add the pagination logic.
 */
export function makeFindManyPaginated(model: ProxyFunctions) {
  return new Proxy(model.findMany, {
    apply: async (target, thisArg, [data, paginationInfo]) => {
      const page = paginationInfo?.page || 1;
      const limit =
        paginationInfo?.limit || paginationInfo?.limit === 0
          ? paginationInfo?.limit
          : 10;

      const query = data || {};
      query.take = limit === 0 ? undefined : limit;
      query.skip = (page - 1) * limit ?? 0;

      const [total, docs] = await Promise.all([
        model.count({
          where: query.where,
        }),
        target.apply(thisArg, [query]),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: docs,
        meta: {
          total,
          lastPage: totalPages === Infinity ? 1 : totalPages,
          currentPage: page,
          perPage: limit,
          prev: page > 1 ? page - 1 : null,
          next: page < totalPages ? page + 1 : null,
        },

      };
    },
  });
}
