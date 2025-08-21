import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/errors.js';
import { sendErrorResponse } from '../utils/response.js';


export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    sendErrorResponse(res, err.errorCode, err.message, err.statusCode);
    return;
  }

  if (err.name === 'ValidationError') {
    sendErrorResponse(res, 'VALIDATION_ERROR', err.message, 422);
    return;
  }

  console.error('Error no controlado:', err);
  sendErrorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' 
      ? 'Ha ocurrido un error interno' 
      : err.message || 'Error interno del servidor',
    500
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendErrorResponse(
    res, 
    'NOT_FOUND', 
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404
  );
};
