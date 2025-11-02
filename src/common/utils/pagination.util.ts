import {
  PaginationMeta,
  PaginatedResponse,
  PaginationParams,
} from '../interfaces/pagination.interface';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../constants/pagination.constants';

export class PaginationUtil {
  static calculatePaginationParams(
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): PaginationParams {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.max(1, limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      skip,
    };
  }

  static createPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    return {
      data,
      meta: this.createPaginationMeta(total, page, limit),
    };
  }
}
