import axiosInstance from '../utils/axiosConfig';
import {
  ReviewSubmitRequest,
  ReviewResponse,
  AverageRatingResponse,
  FetchReviewsRequest,
} from '../model/ReviewSubmitRequest';

export const ReviewService = {
  submitReview: async (request: ReviewSubmitRequest): Promise<ReviewResponse> => {
    console.log('Submitting review with request:', request);
    const response = await axiosInstance.post('/storybooks/reviews/add', request);
    return response.data;
  },

  fetchReviews: async (storyBookId: number): Promise<ReviewResponse[]> => {
    const request: FetchReviewsRequest = { storyBookId };
    const response = await axiosInstance.post('/storybooks/reviews/fetch', request);
    return response.data;
  },

  getAverageRating: async (storyBookId: number): Promise<AverageRatingResponse> => {
    const response = await axiosInstance.get(
      `/storybooks/reviews/rating/${storyBookId}`
    );
    return response.data;
  },
};
