import { NotFoundError } from '../application/errors/not-found-error';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { createPortalCustomer } from '../utils/stripe';
import Stripe from 'stripe';

class CreatePortalService {
  public async execute({
    auth0_id,
  }: {
    auth0_id: string;
  }): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    const userExists = await prismaService.user.findUnique({
      where: { auth0_id },
    });

    if (!userExists) {
      throw new NotFoundError('User not found.');
    }

    const subscriptionExists =
      await prismaService.stripeSubscription.findUnique({
        where: { user_id: userExists.id },
      });

    if (!subscriptionExists) {
      throw new NotFoundError('Subscription not found.');
    }
    const stripeCustomerId = subscriptionExists.customer_id;

    if (!stripeCustomerId) {
      throw new NotFoundError('Stripe Customer ID not found for this clinic.');
    }

    const portal = await createPortalCustomer(stripeCustomerId);

    return portal;
  }
}

export default CreatePortalService;
