import { Router } from 'express';
import usersRoutes from './routes/users.routes';
import sessionsRoutes from './routes/sessions.routes';
import usersCheckoutRouter from './routes/checkout.routes';

const routes = Router();

routes.use('/sessions', sessionsRoutes);
routes.use('/users', usersRoutes);
routes.use('/checkout', usersCheckoutRouter)

export default routes;
