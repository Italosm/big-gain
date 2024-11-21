/* eslint-disable no-console */
import Stripe from 'stripe';
import { env } from '../infrastructure/env-config/env';
import ApplicationError from '../errors/application-error';

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
    return_url: 'https://arbmachine.io/painel',
  });

  return subscription;
};

export const createStripeCoupon = async (data: {
  percentOff?: number; // Percentual de desconto (ex: 20 para 20%)
  amountOff?: number; // Valor fixo de desconto em centavos (ex: 500 para $5.00)
  currency?: string; // Necessário se `amountOff` for usado (ex: "usd")
  duration: 'once' | 'repeating'; // Duração do cupom
  durationInMonths?: number; // Quantidade de meses se `duration` for "repeating"
  name?: string; // Nome opcional para o cupom
}) => {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: data.percentOff,
      amount_off: data.amountOff,
      currency: data.currency,
      duration: data.duration,
      duration_in_months: data.durationInMonths,
      name: data.name,
    });

    return coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw new ApplicationError('Error generating Coupon');
  }
};
