import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { NotFoundError } from '../application/errors/not-found-error';
import { stripe } from '../utils/stripe';

class CheckoutSessionService {
  public async execute(event: { data: { object: Stripe.Checkout.Session } }) {
    const document = event.data.object.client_reference_id as string;
    const subscription_id = event.data.object.subscription as string;
    const customer_id = event.data.object.customer as string;
    const checkoutStatus = event.data.object.status;

    if (checkoutStatus !== 'complete') return;

    if (!document || !subscription_id || !customer_id) {
      throw new ApplicationError(
        'document, subscription_id, customer_id is required',
      );
    }

    const userExists = await prismaService.user.findUnique({
      where: { document },
    });

    if (!userExists) {
      throw new NotFoundError('User not found.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    if (!subscription) {
      throw new NotFoundError('Subscription not found.');
    }

    const current_period_end = subscription.current_period_end;

    const updatedStripeSubscription =
      await prismaService.stripeSubscription.update({
        where: { user_id: userExists.id },
        data: {
          customer_id,
          subscription_id,
          current_period_end: new Date(current_period_end * 1000),
        },
      });

    return updatedStripeSubscription;
  }
}

export default CheckoutSessionService;
