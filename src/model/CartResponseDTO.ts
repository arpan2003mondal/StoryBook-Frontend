export interface CartItem {
  id: number;
  storybookId: number;
  title: string;
  description: string;
  authorName: string;
  categoryName: string;
  price: number;
  audioUrl: string;
  sampleAudioUrl: string;
  coverImageUrl: string;
  quantity: number;
}

export interface CartResponseDTO {
  cartId: number;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
}
