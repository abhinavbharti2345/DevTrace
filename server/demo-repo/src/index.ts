import { handleLoginRequest, handleRegisterRequest } from './routes/auth.routes.js';
import { handleAddToCart, handleCheckout, handleGetCart } from './routes/cart.routes.js';
import { logInfo } from './utils/logger.js';

export function startDemoServer() {
  logInfo('ShopSphere E-Commerce Gateway initialized on port 8080');
}

export {
  handleLoginRequest,
  handleRegisterRequest,
  handleGetCart,
  handleAddToCart,
  handleCheckout,
};
