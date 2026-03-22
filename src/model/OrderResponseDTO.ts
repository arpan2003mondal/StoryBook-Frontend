export interface OrderResponseDTO {
  orderId: number;
  totalAmount: number;
  orderStatus: string;
  itemCount: number;
  createdAt: string;
}
