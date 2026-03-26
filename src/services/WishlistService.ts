import axiosInstance from '../utils/axiosConfig';
import { WishlistResponseDTO } from '../model/WishlistResponseDTO';
import { AddToWishlistRequest } from '../model/AddToWishlistRequest';
import { RemoveFromWishlistRequest } from '../model/RemoveFromWishlistRequest';

export const WishlistService = {
  addToWishlist: async (request: AddToWishlistRequest): Promise<any> => {
    const response = await axiosInstance.post('/wishlist/add', request);
    return response.data;
  },

  getWishlist: async (): Promise<WishlistResponseDTO> => {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  },

  removeFromWishlist: async (request: RemoveFromWishlistRequest): Promise<any> => {
    const response = await axiosInstance.post('/wishlist/remove', request);
    return response.data;
  },
};
