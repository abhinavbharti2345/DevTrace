import { Cart, CartItem, Product } from '../models/cart.model.js';
import { logError, logInfo } from '../utils/logger.js';
import { validateCartQuantity } from '../utils/validator.js';
import { PaymentReceipt, processCharge } from './payment.service.js';

const activeCarts: Map<string, Cart> = new Map();

const productCatalog: Map<string, Product> = new Map([
  ['prod_1', { id: 'prod_1', name: 'Mechanical Keyboard', price: 129.99, stock: 15 }],
  ['prod_2', { id: 'prod_2', name: 'Wireless Ergonomic Mouse', price: 79.5, stock: 40 }],
  ['prod_3', { id: 'prod_3', name: '4K IPS Monitor 27"', price: 349.0, stock: 8 }],
]);

export function getOrCreateCart(userId: string): Cart {
  if (!activeCarts.has(userId)) {
    activeCarts.set(userId, {
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'active',
    });
  }
  return activeCarts.get(userId)!;
}

export function addItemToCart(userId: string, productId: string, quantity: number): Cart {
  if (!validateCartQuantity(quantity)) {
    throw new Error('Invalid item quantity');
  }

  const product = productCatalog.get(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock for product ${product.name}`);
  }

  const cart = getOrCreateCart(userId);
  const existingItem = cart.items.find((i) => i.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      unitPrice: product.price,
    });
  }

  recalculateCart(cart);
  logInfo(`Item ${productId} added to cart for user ${userId}`);
  return cart;
}

export function recalculateCart(cart: Cart): void {
  const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
  cart.subtotal = Math.round(subtotal * 100) / 100;
  cart.tax = tax;
  cart.total = Math.round((subtotal + tax) * 100) / 100;
}

export async function checkoutCart(userId: string): Promise<{ cart: Cart; receipt: PaymentReceipt }> {
  const cart = getOrCreateCart(userId);
  if (cart.items.length === 0) {
    logError(`Checkout failed: Cart is empty for user ${userId}`);
    throw new Error('Cannot checkout an empty cart');
  }

  // Charge payment through payment service
  const receipt = await processCharge(cart.total);
  cart.status = 'checked_out';

  logInfo(`Checkout completed successfully for user ${userId}, Receipt: ${receipt.transactionId}`);
  return { cart, receipt };
}
