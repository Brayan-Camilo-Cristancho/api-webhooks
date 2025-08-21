
export class AppError extends Error {

  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
    
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado', errorCode: string = 'NOT_FOUND') {
    super(message, 404, errorCode, true);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud incorrecta', errorCode: string = 'BAD_REQUEST') {
    super(message, 400, errorCode, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado', errorCode: string = 'UNAUTHORIZED') {
    super(message, 401, errorCode, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido', errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual del recurso', errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode, true);
  }
}

export class ExternalApiError extends AppError {
  constructor(
    message: string = 'Error en servicio externo',
    statusCode: number = 500,
    errorCode: string = 'EXTERNAL_API_ERROR'
  ) {
    super(message, statusCode, errorCode, true);
  }
}

export class GitHubApiError extends ExternalApiError {
  constructor(message: string = 'Error en la API de GitHub', statusCode: number = 500) {
    super(message, statusCode, 'GITHUB_API_ERROR');
  }
}

export class ValidationError extends AppError {
  public readonly validationErrors: Record<string, string>; 

  constructor(
    message: string = 'Error de validación', 
    validationErrors: Record<string, string> = {}
  ) {
    super(message, 422, 'VALIDATION_ERROR', true);
    this.validationErrors = validationErrors;
  }
}
