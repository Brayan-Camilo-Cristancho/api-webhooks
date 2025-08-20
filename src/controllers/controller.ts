import type { NextFunction, Request, Response } from "express";

const generatePullRequest = (req: Request, res: Response, _: NextFunction) => {

	const event = req.headers["x-github-event"];

	const payload = req.body;

	console.log(`Evento recibido: ${event}`);

	console.log(payload);

	if (event === 'push') {

		console.log('Se podría generar un pull request aquí...');
	}

	res.status(200).json({ message: 'Webhook recibido correctamente' });
};

export { generatePullRequest }
