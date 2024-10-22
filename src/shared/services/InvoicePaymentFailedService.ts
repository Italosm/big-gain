import Stripe from 'stripe';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { BadRequestError } from '../application/errors/bad-request-error';
import { NotFoundError } from '../application/errors/not-found-error';
import ApplicationError from '../errors/application-error';

class InvoicePaymentFailedService {
  public async execute(event: { data: { object: Stripe.Invoice } }) {
    const subscriptionId = event.data.object.subscription as string;

    if (!subscriptionId) {
      throw new BadRequestError('Subscription ID is required.');
    }

    const subscriptionExists =
      await prismaService.stripeSubscription.findUnique({
        where: { subscription_id: subscriptionId },
      });

    if (!subscriptionExists) {
      throw new NotFoundError('Subscription not found.');
    }

    try {
      await prismaService.stripeSubscription.update({
        where: { subscription_id: subscriptionId },
        data: {
          subscription_status: 'payment_failed',
        },
      });
      console.log(
        `Subscription ${subscriptionId} status updated to payment_failed.`,
      );
    } catch (error) {
      console.error(`Failed to update subscription status: ${error.message}`);
      throw new ApplicationError('Failed to update subscription status.');
    }
    return;
  }
}

export default InvoicePaymentFailedService;
