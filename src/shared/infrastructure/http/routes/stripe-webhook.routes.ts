import { Router } from 'express';
import CheckoutController from '../controllers/checkout.controller';

const stripeWebHookRouter = Router();
const checkoutController = new CheckoutController();

stripeWebHookRouter.post('/webhook', checkoutController.webhook);

export default stripeWebHookRouter;
