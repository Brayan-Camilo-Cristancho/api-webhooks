import crypto from "crypto";
import type { Request, Response } from 'express';

const GITHUB_SECRET = process.env.GITHUB_SECRET;

function verifySignature(req: Request, _: Response, buf: Buffer) {

    const signature = req.headers["x-hub-signature-256"] as string | undefined;

    if (!signature) {
        throw new Error("Firma no encontrada en headers");
    }

    if(!GITHUB_SECRET) {
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

export { verifySignature }