import CancelPlanService from '@/shared/services/CancelPlanService';
import CheckoutSessionService from '@/shared/services/CheckoutSessionService';
import CreateCheckoutService from '@/shared/services/CreateCheckoutService';
import CreatePortalService from '@/shared/services/CreatePortalService';
import SubscriptionService from '@/shared/services/SubscriptionService';
import { stripe } from '@/shared/utils/stripe';
import { Request, Response } from 'express';
import { auth0IdSchema } from '../schemas/schemas';
import UpcomingInvoiceService from '@/shared/services/UpcomingInvoiceService';

class CheckoutController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { auth0_id } = request.params;
    auth0IdSchema.parse(auth0_id);
    const price = request.query.price
      ? (request.query.price as string)
      : undefined;
    const checkoutUser = new CreateCheckoutService();
    const url = await checkoutUser.execute({
      auth0_id,
      price,
    });
    return response.json(url);
  }

  public async createPortal(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { auth0_id } = request.params;
    const portalUser = new CreatePortalService();
    const portal = await portalUser.execute({
      auth0_id,
    });
    return response.json(portal);
  }

  public async webhook(
    request: Request,
    response: Response,
  ): Promise<Response | void> {
    const signature = request.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_ID_WEBHOOK as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret,
      );
    } catch (err) {
      response.status(400).send(err);
      return;
    }
    const checkoutSession = new CheckoutSessionService();
    const subscriptionService = new SubscriptionService();
    const cancelPlan = new CancelPlanService();
    const upcomingInvoice = new UpcomingInvoiceService();
    switch (event.type) {
      case 'checkout.session.completed':
        await checkoutSession.execute(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await subscriptionService.execute(event);
        break;
      case 'invoice.upcoming':
        await upcomingInvoice.execute(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await cancelPlan.execute(event);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    response.send();
  }
}

export default CheckoutController;
