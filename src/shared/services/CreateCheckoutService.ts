import { BadRequestError } from '../application/errors/bad-request-error';
import { NotFoundError } from '../application/errors/not-found-error';
import { prismaService } from '../infrastructure/database/prisma/prisma.service';
import { generateCheckout } from '../utils/stripe';

interface CheckoutResponse {
  url: string | null;
}

class CreateCheckoutService {
  public async execute({
    auth0_id,
    price,
    coupon,
  }: {
    auth0_id: string;
    price: string;
    coupon: string;
  }): Promise<CheckoutResponse | undefined> {
    const userExists = await prismaService.user.findUnique({
      where: { auth0_id },
    });

    if (!userExists) {
      throw new NotFoundError('User not found.');
    }

    if (!price) {
      throw new BadRequestError('Price product is required.');
    }

    const email = userExists.email;
    const name = userExists.document;

    const checkout = await generateCheckout(name, email, price, coupon);

    return checkout;
  }
}

export default CreateCheckoutService;
