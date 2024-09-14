import { Router } from 'express';
import CheckoutController from '../controllers/checkout.controller';

const usersCheckoutRouter = Router();
const checkoutController = new CheckoutController();

usersCheckoutRouter.get('/:auth0_id', async (req, res) => {
  return checkoutController.show(req, res);
});

usersCheckoutRouter.get('/portal/:auth0_id', async (req, res) => {
  return checkoutController.createPortal(req, res);
});

export default usersCheckoutRouter;
