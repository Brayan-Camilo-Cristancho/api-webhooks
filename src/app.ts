import express, { json, urlencoded } from 'express';
import type { Application } from 'express';
import { setRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/index.js';
import { appConfig } from './config/index.js';
import { authApi } from './auth/index.js';

const app: Application = express();
const PORT = appConfig.app.port;

app.disable('x-powered-by');
app.use(json());
app.use(urlencoded({ extended: true }));

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
