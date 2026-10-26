import { addItemToCart, checkoutCart, getOrCreateCart } from '../services/cart.service.js';
import { authMiddleware } from './auth.routes.js';

export function handleGetCart(authHeader?: string) {
  const session = authMiddleware(authHeader);
  return getOrCreateCart(session.userId);
}

export function handleAddToCart(
  authHeader: string | undefined,
  body: { productId: string; quantity: number }
) {
  const session = authMiddleware(authHeader);
  return addItemToCart(session.userId, body.productId, body.quantity);
}

export async function handleCheckout(authHeader?: string) {
  const session = authMiddleware(authHeader);
  return checkoutCart(session.userId);
}
