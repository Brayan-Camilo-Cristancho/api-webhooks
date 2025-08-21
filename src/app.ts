import express, { json } from 'express';
import type { Application } from 'express';
import { setRoutes } from './routes/index.js';

import { authApi } from './config/config.js';
import { errorHandler, notFoundHandler } from './middlewares/index.js';

const app: Application = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.disable('x-powered-by');
app.use(json());

setRoutes(app);

app.use(notFoundHandler);

app.use(errorHandler);

try {

  await authApi();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(` Server is running on http://0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error("Error al inicializar la app:", error);
  process.exit(1);
}
