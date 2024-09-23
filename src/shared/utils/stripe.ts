import Stripe from 'stripe';
import { env } from '../infrastructure/env-config/env';
import { NotFoundError } from '../application/errors/not-found-error';

export const stripe = new Stripe(env.STRIPE_SECRET, {
  httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
  const customer = await stripe.customers.list({ email });
  return customer.data[0];
};

export const createStripeCustomer = async (data: {
  email: string;
  name?: string;
}) => {
  const customer = await getStripeCustomerByEmail(data?.email);
  if (customer) return customer;

  return stripe.customers.create({
    email: data.email,
    name: data.name,
  });
};

export const checkIfPriceExists = async (priceId: string) => {
  try {
    const prices = await stripe.prices.list({
      limit: 1,
      lookup_keys: [priceId],
      active: true,
    });

    return prices.data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar o preço no Stripe:', error);
    return false;
  }
};

export const generateCheckout = async (
  name: string,
  email: string,
  price: string,
) => {
  try {
    const priceExists = await checkIfPriceExists(price);
    if (!priceExists) {
      throw new NotFoundError(`O preço ${price} não existe no Stripe.`);
    }
    const customer = await createStripeCustomer({
      email,
      name,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: name,
      customer: customer.id,
      success_url: `https://arbmachine.io/api/checkout?status=sucesso`,
      cancel_url: `https://arbmachine.io/api/checkout?status=error`,
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
    });
    return {
      url: session.url,
    };
  } catch (error) {
    console.log('errr', error);
  }
};

export const handleCancelSubscription = async (idSubscriptions: string) => {
  const subscription = await stripe.subscriptions.update(idSubscriptions, {
    cancel_at_period_end: true,
  });

  return subscription;
};

export const createPortalCustomer = async (idCustomer: string) => {
  const subscription = await stripe.billingPortal.sessions.create({
    customer: idCustomer,
    return_url: 'https://arbmachine.io/api/checkout?status=sucesso',
  });

  return subscription;
};
