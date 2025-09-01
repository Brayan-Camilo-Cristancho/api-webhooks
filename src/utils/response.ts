import type { Response } from 'express';
import type { ApiResponse } from '../core/index.js';



export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

export function createErrorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message }
  };
}

export function sendSuccessResponse<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(createSuccessResponse(data));
}

export function sendErrorResponse(res: Response, code: string, message: string, statusCode = 400): void {
  res.status(statusCode).json(createErrorResponse(code, message));
}