import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';
import { stripe } from '../utils/stripe';

class UpcomingInvoiceService {
  public async execute(invoice: Stripe.Invoice) {
    const customer_id = invoice.customer as string;
    const subscription_id = invoice.subscription as string;

    if (!customer_id || !subscription_id) {
      throw new ApplicationError(
        'Customer ID and Subscription ID are required.',
      );
    }

    try {
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(
        invoice.id,
      );

      console.log(
        `Invoice finalized for customer ${customer_id} and subscription ${subscription_id}`,
      );
      return finalizedInvoice;
    } catch (error) {
      console.error(`Failed to finalize invoice: ${error.message}`);
      throw new ApplicationError('Failed to finalize invoice.');
    }
  }
}

export default UpcomingInvoiceService;
