import React, { useState, useEffect } from 'react';
import { ReviewService } from '../services/ReviewService';
import { ReviewResponse } from '../model/ReviewSubmitRequest';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import '../styles/ReviewsList.css';

interface ReviewsListProps {
  storyBookId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ storyBookId, isOpen, onClose }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
      fetchAverageRating();
    }
  }, [isOpen, storyBookId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const fetchedReviews = await ReviewService.fetchReviews(storyBookId);
      setReviews(fetchedReviews);
    } catch (error: any) {
      ToastService.showError(Messages.FAILED_TO_FETCH_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const ratingData = await ReviewService.getAverageRating(storyBookId);
      setAverageRating(ratingData.averageRating || 0);
      setTotalReviews(ratingData.totalReviews || 0);
    } catch (error: any) {
      console.error('Failed to fetch average rating');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'filled' : 'empty'}`}
          ></i>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal-header">
          <div className="ratings-summary">
            <h2>{Messages.REVIEWS_TITLE}</h2>
            {totalReviews > 0 && (
              <div className="avg-rating">
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <div className="rating-stars">{renderStars(Math.round(averageRating))}</div>
                <span className="review-count">({totalReviews} reviews)</span>
              </div>
            )}
          </div>
          <button className="reviews-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="reviews-container">
          {loading ? (
            <div className="loading-spinner">{Messages.LOADING_REVIEWS}</div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">{Messages.NO_REVIEWS_YET}</div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.reviewId} className="review-card">
                  <div className="review-header">
                    <div className="review-user-info">
                      <p className="review-username">{review.userName}</p>
                      <p className="review-date">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-text">{review.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsList;
