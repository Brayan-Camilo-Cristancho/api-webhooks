import type { Request, Response, NextFunction } from 'express';
import { AppError, sendErrorResponse } from '../utils/index.js';
import { sendToPowerAutomate } from '../services/comunicationService.js';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {

  console.error('Error:', err);

  sendToPowerAutomate(
    {
      event: 'Internal Server Error',
      message: 'Ha ocurrido un error interno en el servidor',
      repository: 'N/A',
      branch: 'N/A',
      alert: err.message || 'error',
      category: 'error',
      sourceUrl: 'N/A',
      actor: 'N/A'
    }
  )

  if (err instanceof AppError) {
    sendErrorResponse(res, err.errorCode, err.message, err.statusCode);
    return;
  }

  if (err.name === 'ValidationError') {
    sendErrorResponse(res, 'VALIDATION_ERROR', err.message, 422);
    return;
  }

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

  console.error('Ruta no encontrada:', `${req.method} ${req.originalUrl}`);

  sendErrorResponse(
    res,
    'NOT_FOUND',
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404
  );

};
