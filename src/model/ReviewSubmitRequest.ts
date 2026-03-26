export interface ReviewSubmitRequest {
  userId: number;
  storyBookId: number;
  rating: number; // 1-5
  reviewText: string;
}

export interface ReviewResponse {
  reviewId: number;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string; // ISO date string
}

export interface AverageRatingResponse {
  storyBookId: number;
  averageRating: number;
  totalReviews: number;
}

export interface FetchReviewsRequest {
  storyBookId: number;
}
