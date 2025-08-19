import express, { json } from 'express';
import type { Application } from 'express';
import { setRoutes } from './routes/index.js';
import someMiddleware from './middlewares/middlewares.js';

const app: Application = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.disable('x-powered-by');
app.use(json());
app.use(someMiddleware);

setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});