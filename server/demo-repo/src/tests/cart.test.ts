import { addItemToCart, checkoutCart, getOrCreateCart, recalculateCart } from '../services/cart.service.js';

export function runCartTests(): boolean {
  const userId = 'usr_test_cart';
  const cart = getOrCreateCart(userId);

  if (cart.status !== 'active') {
    throw new Error('Initial cart status must be active');
  }

  // Add item test
  const updatedCart = addItemToCart(userId, 'prod_1', 2);
  if (updatedCart.items.length !== 1 || updatedCart.subtotal !== 259.98) {
    throw new Error('Cart calculation failed');
  }

  return true;
}
