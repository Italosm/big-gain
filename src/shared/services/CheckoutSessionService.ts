import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { NotFoundError } from '../application/errors/not-found-error';

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

    
    const updatedStripeSubscription = await prismaService.stripeSubscription.update({
      where: { user_id: userExists.id },
      data: {
        customer_id,
        subscription_id
        
      },
    });

    return updatedStripeSubscription;
  }
}

export default CheckoutSessionService;