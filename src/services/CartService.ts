import axios, { AxiosError } from 'axios';
import { CartResponseDTO } from '../model/CartResponseDTO';
import { AddToCartRequest } from '../model/AddToCartRequest';
import { OrderResponseDTO } from '../model/OrderResponseDTO';
import { Messages } from '../messages/messages';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class CartService {
  private static listeners: ((cart: CartResponseDTO | null) => void)[] = [];
  private static currentCart: CartResponseDTO | null = null;

  /**
   * Subscribe to cart updates
   */
  static subscribe(listener: (cart: CartResponseDTO | null) => void): () => void {
    this.listeners.push(listener);
    // Immediately call listener with current state
    listener(this.currentCart);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of cart changes
   */
  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentCart));
  }

  /**
   * Extract error message from axios error
   */
  private static getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      // Check for custom error message from backend
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      }

      // Check HTTP status codes
      switch (axiosError.response?.status) {
        case 400:
          return Messages.INVALID_REQUEST;
        case 401:
          return Messages.SESSION_EXPIRED;
        case 403:
          return Messages.PERMISSION_DENIED;
        case 404:
          return Messages.ITEM_NOT_FOUND;
        case 409:
          return Messages.ITEM_ALREADY_IN_CART;
        case 422:
          return Messages.INVALID_CART_ITEM;
        case 500:
          return Messages.SERVER_ERROR;
        case 503:
          return Messages.SERVICE_UNAVAILABLE;
        default:
          return axiosError.message || Messages.GENERAL_ERROR;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return Messages.UNEXPECTED_ERROR;
  }

  /**
   * Add storybook to cart
   */
  static async addToCart(request: AddToCartRequest): Promise<ApiResponse<CartResponseDTO>> {
    try {
      if (!request.storybookId || !request.quantity || request.quantity <= 0) {
        return {
          success: false,
          message: Messages.INVALID_ITEM_QUANTITY,
          error: 'INVALID_REQUEST'
        };
      }

      const response = await axios.post('/cart/add', request);

      if (response.data.cart) {
        this.currentCart = response.data.cart;
        this.notifyListeners();
      }

      return {
        success: true,
        data: response.data.cart || response.data,
        message: response.data.message || `${Messages.ITEM_ADDED_TO_CART} (${response.data.cart?.totalItems || 1} items)`,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      return {
        success: false,
        message: errorMessage,
        error: 'ADD_TO_CART_FAILED'
      };
    }
  }

  /**
   * Get user's cart
   */
  static async getCart(): Promise<ApiResponse<CartResponseDTO>> {
    try {
      const response = await axios.get('/cart');

      const data = response.data;
      let cart: CartResponseDTO;

      // Handle various response structures from backend
      if (data.cart && typeof data.cart === 'object') {
        cart = data.cart;
      } else if (data.data && typeof data.data === 'object') {
        cart = data.data;
      } else {
        cart = data;
      }

      // Validate cart structure
      if (!cart.cartItems) {
        cart.cartItems = [];
      }
      if (cart.totalItems === undefined) {
        cart.totalItems = cart.cartItems.length || 0;
      }

      this.currentCart = cart;
      this.notifyListeners();

      return {
        success: true,
        data: cart,
        message: `${Messages.CART_LOADED} (${cart.totalItems} items)`,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);


      // Reset cart on error
      this.currentCart = null;
      this.notifyListeners();

      return {
        success: false,
        message: errorMessage,
        error: 'GET_CART_FAILED'
      };
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(cartItemId: number): Promise<ApiResponse<CartResponseDTO>> {
    try {
      if (!cartItemId || cartItemId <= 0) {
        return {
          success: false,
          message: Messages.INVALID_REQUEST,
          error: 'INVALID_ITEM_ID'
        };
      }

      const response = await axios.delete(`/cart/items/${cartItemId}`);

      if (response.data.cart) {
        this.currentCart = response.data.cart;
        this.notifyListeners();
      }

      return {
        success: true,
        data: response.data.cart || response.data,
        message: response.data.message || Messages.ITEM_REMOVED_FROM_CART,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);


      return {
        success: false,
        message: errorMessage,
        error: 'REMOVE_FROM_CART_FAILED'
      };
    }
  }

  /**
   * Checkout and create order from cart
   */
  static async checkout(): Promise<ApiResponse<OrderResponseDTO>> {
    try {
      // Validate cart before checkout
      if (!this.currentCart || !this.currentCart.cartItems || this.currentCart.cartItems.length === 0) {
        return {
          success: false,
          message: Messages.EMPTY_CART,
          error: 'EMPTY_CART'
        };
      }

      const response = await axios.post('/wallet/checkout');

      // Clear cart after successful checkout
      this.currentCart = null;
      this.notifyListeners();

      return {
        success: true,
        data: response.data.order || response.data,
        message: response.data.message || Messages.CHECKOUT_SUCCESS,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      // Specific error handling for checkout
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 402) {
          return {
            success: false,
            message: Messages.INSUFFICIENT_BALANCE,
            error: 'INSUFFICIENT_BALANCE'
          };
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: 'CHECKOUT_FAILED'
      };
    }
  }

  /**
   * Clear cart locally
   */
  static clearCart(): void {
    this.currentCart = null;
    this.notifyListeners();
  }

  /**
   * Get current cart item count
   */
  static getCartItemCount(): number {
    return this.currentCart?.totalItems || 0;
  }
}
