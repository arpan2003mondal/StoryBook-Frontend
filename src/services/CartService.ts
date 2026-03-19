import axios from 'axios';
import { CartResponseDTO } from '../model/CartResponseDTO';
import { AddToCartRequest } from '../model/AddToCartRequest';

export class CartService {
  
  /**
   * Add storybook to cart
   */
  static addToCart(request: AddToCartRequest): Promise<{ message: string; cart: CartResponseDTO }> {
    return axios
      .post('/storybooks/cart/add', request)
      .then(response => response.data);
  }

  /**
   * Get user's cart
   */
  static getCart(): Promise<CartResponseDTO> {
    return axios
      .get('/storybooks/cart')
      .then(response => {
        console.log('CartService raw response:', response);
        // Handle various response structures from backend
        const data = response.data;
        // If wrapped in { cart: {...} }
        if (data.cart && typeof data.cart === 'object') {
          console.log('Unwrapping cart from response.data.cart');
          return data.cart;
        }
        // If wrapped in { data: {...} }
        if (data.data && typeof data.data === 'object') {
          console.log('Unwrapping cart from response.data.data');
          return data.data;
        }
        // Otherwise assume direct response
        console.log('Using direct response.data');
        return data;
      });
  }

  /**
   * Remove item from cart
   */
  static removeFromCart(cartItemId: number): Promise<{ message: string; cart: CartResponseDTO }> {
    return axios
      .delete(`/storybooks/cart/items/${cartItemId}`)
      .then(response => response.data);
  }
}
