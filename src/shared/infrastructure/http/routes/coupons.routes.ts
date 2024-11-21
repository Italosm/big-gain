import { Router } from 'express';
import { createStripeCouponSchema } from '../schemas/schemas';
import { createStripeCoupon } from '@/shared/utils/stripe';

const couponsRouter = Router();

couponsRouter.post('/', async (req, res) => {
  const { percentOff, amountOff, currency, duration, durationInMonths, name } =
    createStripeCouponSchema.parse(req.body);
  const coupon = await createStripeCoupon({
    percentOff,
    amountOff,
    currency,
    duration,
    durationInMonths,
    name,
  });
  return res.status(201).json(coupon);
});

export default couponsRouter;
