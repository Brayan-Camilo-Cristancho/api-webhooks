import crypto from "crypto";
import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from "../utils/index.js";

const GITHUB_SECRET = process.env.GITHUB_SECRET;

function verifySignature(req: Request, _: Response, buf: Buffer) {

    const signature = req.headers["x-hub-signature-256"] as string | undefined;

    if (!signature) {
        throw new Error("Firma no encontrada en headers");
    }

    if (!GITHUB_SECRET) {
        throw new Error("Clave secreta")
    }

    const hmac = crypto.createHmac("sha256", GITHUB_SECRET);

    hmac.update(buf);


    const digest = `sha256=${hmac.digest("hex")}`;

    const sigBuf = Buffer.from(signature);

    const digBuf = Buffer.from(digest);

    if (
        sigBuf.length !== digBuf.length ||
        !crypto.timingSafeEqual(sigBuf, digBuf)
    ) {
        throw new Error("Firma inválida");
    }
}

export function validateJsonMiddleware(req: Request, res: Response, next: NextFunction) {
    
    const contentType = req.headers["content-type"];
    
    const eventType = req.headers["x-github-event"];
    
    const userAgent = req.headers["user-agent"] || "";

    if (userAgent.includes("mrtscan") || userAgent.includes("HealthCheck")) {
        
        return res.status(200).send("Ignored health check");
    
    }

    const exceptions = ["ping"];

    if (exceptions.includes(eventType as string)) {

        return next();

    }

    if (!contentType?.includes("application/json")) {
        throw new BadRequestError(
            `El tipo de contenido debe ser 'application/json'. Recibido: ${contentType}`,
            "INVALID_CONTENT_TYPE"
        );
    }

    next();
}



export { verifySignature }