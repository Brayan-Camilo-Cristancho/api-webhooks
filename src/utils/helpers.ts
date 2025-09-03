import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const safeAsync = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw err;
    }
  };
};

export const fillTemplate = (template: any, data: Record<string, string>): any => {
  const jsonString = JSON.stringify(template);
  const replaced = jsonString.replace(/\$\{(.*?)\}/g, (_, key) => {
    return data[key.trim()] ?? "";
  });
  return JSON.parse(replaced);
};

export const mapSeverityConfig = (category: string) => {
  const config: Record<string, { color: string; badge: string }> = {
    high: { color: "#CC0000", badge: "ALTA" },
    medium: { color: "#FFA500", badge: "MEDIA" },
    low: { color: "#0078D4", badge: "BAJA" },
    success: { color: "#28A745", badge: "ÉXITO" },
    notify: { color: "#808080", badge: "NOTIFICACIÓN" },
  };
  return config[category] ?? config.notify;
};