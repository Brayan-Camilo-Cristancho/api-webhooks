import type { Application, Request, Response } from 'express';
import { json } from 'express';
import crypto from "crypto";

const GITHUB_SECRET = process.env.GITHUB_SECRET || "miSuperSecreto123";


function verifySignature(req: Request, res: Response, buf: Buffer) {

    const signature = req.headers["x-hub-signature-256"] as string | undefined;

    if (!signature) {
        throw new Error("Firma no encontrada en headers");
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

export function setRoutes(app: Application) {
    app.get('/', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.get('/test-worker', (req: Request, res: Response) => {
        res.json({ message: 'API funcionando con TypeScript' });
    });

    app.post(
        "/webhooks/github",
        json({ verify: verifySignature }),
        (req: Request, res: Response) => {
            const event = req.headers["x-github-event"];
            const payload = req.body;

            console.log(`Evento recibido: ${event}`);
            console.log(payload);

            res.status(200).send("OK");
        }
    );
}