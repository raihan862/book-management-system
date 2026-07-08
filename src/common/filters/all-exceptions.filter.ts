import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiErrorResponse } from '@common/interfaces/api-response.interface';

/**
 * Error response interface
 */

/**
 * Global exception filter that catches ALL types of errors
 * and normalizes them into a consistent response format
 *
 * Handles:
 * - Validation errors (class-validator)
 * - Prisma database errors
 * - HTTP exceptions (built-in NestJS)
 * - Unknown errors
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    const messageStr = Array.isArray(errorResponse.message)
      ? errorResponse.message.join(', ')
      : errorResponse.message;

    this.logger.error(
      `${errorResponse.error} [${request.method}] ${request.url} - ${messageStr}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ApiErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle HTTP Exceptions (including validation errors)
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp, path);
    }

    // Handle Prisma Errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, timestamp, path);
    }

    if (this.isPrismaError(exception)) {
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          exception instanceof Error
            ? exception.message
            : 'Database error occurred',
        error: 'Database Error',
        timestamp,
        path,
      };
    }

    // Handle unknown errors
    return this.handleUnknownError(exception, timestamp, path);
  }

  /**
   * Handle NestJS HTTP exceptions (including validation errors)
   */
  private handleHttpException(
    exception: HttpException,
    timestamp: string,
    path: string,
  ): ApiErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = HttpStatus[status] || 'Error';
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as Record<string, unknown>;

      const responseMessage = responseObj['message'];
      if (Array.isArray(responseMessage)) {
        message = responseMessage.map((m) => String(m));
      } else if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else {
        message = exception.message;
      }

      const responseError = responseObj['error'];
      error =
        typeof responseError === 'string'
          ? responseError
          : HttpStatus[status] || 'Error';
    } else {
      message = exception.message;
      error = HttpStatus[status] || 'Error';
    }

    return {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp,
      path,
    };
  }

  /**
   * Handle Prisma database errors
   */
  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    timestamp: string,
    path: string,
  ): ApiErrorResponse {
    // P2002: Unique constraint violation
    if (exception.code === 'P2002') {
      const meta = exception.meta;
      const target = meta?.['target'];
      const field =
        (Array.isArray(target) && typeof target[0] === 'string'
          ? target[0]
          : null) || 'field';
      return {
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: `A record with this ${field} already exists`,
        error: 'Conflict',
        timestamp,
        path,
      };
    }

    // P2025: Record not found
    if (exception.code === 'P2025') {
      return {
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: 'Not Found',
        timestamp,
        path,
      };
    }

    // P2003: Foreign key constraint failed
    if (exception.code === 'P2003') {
      const meta = exception.meta;
      const fieldName = meta?.['field_name'];
      const field =
        typeof fieldName === 'string' ? fieldName : 'related record';
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid reference: ${field} does not exist`,
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // P2014: Relation violation
    if (exception.code === 'P2014') {
      return {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'The change would violate a required relation',
        error: 'Bad Request',
        timestamp,
        path,
      };
    }

    // Other Prisma errors
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message || 'Database error occurred',
      error: 'Database Error',
      timestamp,
      path,
    };
  }

  /**
   * Handle unknown/unexpected errors
   */
  private handleUnknownError(
    exception: unknown,
    timestamp: string,
    path: string,
  ): ApiErrorResponse {
    const message =
      exception instanceof Error
        ? exception.message
        : 'An unexpected error occurred';

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      error: 'Internal Server Error',
      timestamp,
      path,
    };
  }

  /**
   * Type guard to check if error is a Prisma error
   */
  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientValidationError
    );
  }
}
