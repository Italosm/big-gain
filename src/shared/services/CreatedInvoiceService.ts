import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';
import { stripe } from '../utils/stripe';

class CreatedInvoiceService {
  public async execute(invoice: Stripe.Invoice) {
    const customer_id = invoice.customer as string;
    const subscription_id = invoice.subscription as string;
    const invoice_id = invoice.id as string;

    if (!customer_id || !subscription_id || !invoice_id) {
      throw new ApplicationError(
        'Customer ID, Subscription ID, and Invoice ID are required.',
      );
    }

    if (invoice.status === 'draft') {
      try {
        await stripe.invoices.finalizeInvoice(invoice_id);
        console.log(
          `Invoice finalized for customer ${customer_id} and subscription ${subscription_id}`,
        );
        return;
      } catch (error) {
        console.error(`Failed to finalize invoice: ${error.message}`);
        throw new ApplicationError('Failed to finalize invoice.');
      }
    } else {
      console.log(
        `Invoice ${invoice_id} for customer ${customer_id} is already finalized or not in draft state.`,
      );
    }
  }
}

export default CreatedInvoiceService;
