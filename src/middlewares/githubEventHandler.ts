import type { Request, Response, NextFunction } from "express";


export function githubPingHandler(req: Request, res: Response, next: NextFunction) {
  const event = req.headers["x-github-event"] as string;

  if (event === "ping") {
    return res.status(200).json({ message: "pong", zen: req.body?.zen });
  }

  next();
}