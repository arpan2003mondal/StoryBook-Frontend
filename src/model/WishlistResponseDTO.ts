import { WishlistItemDTO } from './WishlistItemDTO';

export interface WishlistResponseDTO {
  wishlistItems: WishlistItemDTO[];
  totalItems: number;
}
