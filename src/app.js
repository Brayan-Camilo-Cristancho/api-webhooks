import express, { json } from 'express';
import { setRoutes } from './routes/index';
import someMiddleware from './middlewares/middlewares';
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.disable('x-powered-by');
app.use(json());
app.use(someMiddleware);
setRoutes(app);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map