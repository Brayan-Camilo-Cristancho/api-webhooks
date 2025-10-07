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

    const userAgent = req.headers["user-agent"];

    console.log("---- Webhook recibido ----");
    console.log("Fecha:", new Date().toISOString());
    console.log("User-Agent:", userAgent);
    console.log("Content-Type:", contentType);
    console.log("X-GitHub-Event:", eventType);
    console.log("Body recibido:", req.body);
    console.log("--------------------------");

    const exceptions = ["ping"];

    if (exceptions.includes(eventType as string)) {
        console.log("Evento 'ping' detectado. Se omite validación de contenido JSON.");
        return next();
    }

    if (!contentType?.includes("application/json")) {
        console.warn(`❌ Tipo de contenido inválido: ${contentType}`);
        throw new BadRequestError(
            `El tipo de contenido debe ser 'application/json'. Recibido: ${contentType}`,
            "INVALID_CONTENT_TYPE"
        );
    }

    console.log("✅ Tipo de contenido válido. Continuando con el flujo...");
    next();
}


export { verifySignature }