import { stripe } from '@/shared/utils/stripe';
import { Request, Response } from 'express';
// import CreateCheckoutService from '@modules/clinics/services/CreateCheckoutService';
// import CheckoutSessionService from '@modules/clinics/services/CheckoutSessionService';
// import CreateSubscriptionService from '@modules/clinics/services/CreateSubscriptionService';
// import CancelPlanService from '@modules/clinics/services/CancelPlanService';
// import CreatePortalService from '@modules/clinics/services/CreatePortalService';

class CheckoutController {
  // public async show(request: Request, response: Response): Promise<Response> {
  //   const { clinic_id } = request.params;
  //   const price = request.query.price
  //     ? (request.query.price as string)
  //     : undefined;
  //   const checkoutClinic = container.resolve(CreateCheckoutService);
  //   const url = await checkoutClinic.execute({
  //     clinic_id,
  //     price,
  //   });
  //   return response.json(url);
  // }

  // public async createPortal(
  //   request: Request,
  //   response: Response,
  // ): Promise<Response> {
  //   const { clinic_id } = request.params;
  //   const portalClinic = container.resolve(CreatePortalService);
  //   const portal = await portalClinic.execute({
  //     clinic_id,
  //   });
  //   return response.json(portal);
  // }
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
    // const checkoutSession = container.resolve(CheckoutSessionService);
    // const subscriptionService = container.resolve(CreateSubscriptionService);
    // const cancelPlan = container.resolve(CancelPlanService);
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     await checkoutSession.execute(event);
    //     break;
    //   case 'customer.subscription.created':
    //   case 'customer.subscription.updated':
    //     await subscriptionService.execute(event);
    //     break;
    //   case 'customer.subscription.deleted':
    //     await cancelPlan.execute(event);
    //     break;
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }
    response.send();
  }
}

export default CheckoutController;
