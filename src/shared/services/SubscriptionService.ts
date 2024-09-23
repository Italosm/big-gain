import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';

class SubscriptionService {
  public async execute(event: { data: { object: Stripe.Subscription } }) {
    const subscription_status = event.data.object.status;
    const customer_id = event.data.object.customer as string;
    const subscription_id = event.data.object.id as string;
    const current_period_end = event.data.object.current_period_end;
    if (
      !customer_id ||
      !subscription_id ||
      !subscription_status ||
      !current_period_end
    ) {
      throw new ApplicationError(
        'customer_id, subscription_id, and subscription_status are required.',
      );
    }

    const stripeSubscriptionExists =
      await prismaService.stripeSubscription.findUnique({
        where: { customer_id },
      });

    if (!stripeSubscriptionExists) {
      throw new ApplicationError('Stripe Subscription not found.');
    }

    const updatedSubscription = await prismaService.stripeSubscription.update({
      where: { customer_id },
      data: {
        customer_id,
        subscription_id,
        subscription_status,
        current_period_end: new Date(current_period_end * 1000),
      },
    });

    return updatedSubscription;
  }
}

export default SubscriptionService;
