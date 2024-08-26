import { Router } from 'express';
import usersRoutes from './routes/users.routes';
import sessionsRoutes from './routes/sessions.routes';

const routes = Router();

routes.use('/sessions', sessionsRoutes);
routes.use('/users', usersRoutes);

export default routes;
