import Stripe from 'stripe';

export const stripe: Stripe = new Stripe(process.env.STRIPE_KEY!);
