import Stripe from 'stripe';
import ApplicationError from '../errors/application-error';

class UpcomingInvoiceService {
  public async execute(invoice: Stripe.Invoice) {
    const customer_id = invoice.customer as string;
    const subscription_id = invoice.subscription as string;
    const invoice_id = invoice.id as string;

    if (!customer_id || !subscription_id || !invoice_id) {
      throw new ApplicationError(
        'Customer ID and Subscription ID and Invoice ID are required.',
      );
    }

    console.log(
      `Invoice is upcoming for customer ${customer_id} and subscription ${subscription_id}. Invoice ID: ${invoice_id}`,
    );
    return;
  }
}

export default UpcomingInvoiceService;
