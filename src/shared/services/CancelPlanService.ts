import Stripe from 'stripe';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { NotFoundError } from '../application/errors/not-found-error';
import { BadRequestError } from '../application/errors/bad-request-error';
import { stripe } from '../utils/stripe';

class CancelPlanService {
  public async execute(event: { data: { object: Stripe.Subscription } }) {
    const customerId = event.data.object.customer as string;
    const subscriptionStatus = event.data.object.status as string;
    const subscriptionId = event.data.object.id as string;

    if (!customerId) {
      throw new BadRequestError('Customer ID is required.');
    }

    if (
      subscriptionStatus === 'active' ||
      subscriptionStatus === 'trialing' ||
      subscriptionStatus === 'past_due'
    ) {
      try {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return;
      } catch (error) {
        throw new Error('Failed to update subscription with Stripe.');
      }
    }

    const subscriptionExists =
      await prismaService.stripeSubscription.findUnique({
        where: { customer_id: customerId },
      });

    if (!subscriptionExists) {
      throw new NotFoundError('Subscription not found.');
    }

    if (
      subscriptionStatus === 'canceled' &&
      subscriptionExists.subscription_status !== 'canceled'
    ) {
      await prismaService.stripeSubscription.update({
        where: { customer_id: customerId },
        data: {
          subscription_status: 'canceled',
        },
      });
    }
    return;
  }
}

export default CancelPlanService;
