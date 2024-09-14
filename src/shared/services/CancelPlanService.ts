import Stripe from 'stripe';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { NotFoundError } from '../application/errors/not-found-error';
import { BadRequestError } from '../application/errors/bad-request-error';

class CancelPlanService {
  
  public async execute(event: { data: { object: Stripe.Subscription } }) {
    const customer_id = event.data.object.customer as string;

    if (!customer_id) {
      throw new BadRequestError('Customer ID is required.');
    }

    const subscriptionExists = await prismaService.stripeSubscription.findUnique({
      where: { customer_id },
    });

    if (!subscriptionExists) {
      throw new NotFoundError('User not found.');
    }

    const updatedSubscription = await prismaService.stripeSubscription.update({
      where: { customer_id },
      data: {
        subscription_status: null,
      },
    });

    return updatedSubscription;
  }
}

export default CancelPlanService;
