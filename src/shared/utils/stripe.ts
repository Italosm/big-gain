/* eslint-disable no-console */
import Stripe from 'stripe';
import { env } from '../infrastructure/env-config/env';

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

export const generateCheckout = async (
  name: string,
  email: string,
  price: string,
  coupon?: string,
) => {
  try {
    const customer = await createStripeCustomer({
      email,
      name,
    });

    const discounts = coupon ? [{ coupon }] : undefined;

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
      discounts: discounts,
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
    return_url: 'https://arbmachine.io/usuario',
  });

  return subscription;
};
