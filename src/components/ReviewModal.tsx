import React, { useState } from 'react';
import { ReviewService } from '../services/ReviewService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import '../styles/ReviewModal.css';

interface ReviewModalProps {
  storyBookId: number;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  storyBookId,
  userId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const MAX_CHARS = 1000;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setReviewText(text);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      ToastService.showError(Messages.SELECT_RATING_ERROR);
      return;
    }

    if (reviewText.trim().length === 0) {
      ToastService.showError(Messages.WRITE_REVIEW_ERROR);
      return;
    }

    setLoading(true);
    try {
      await ReviewService.submitReview({
        userId,
        storyBookId,
        rating,
        reviewText,
      });

      ToastService.showSuccess(Messages.REVIEW_SUBMIT_SUCCESS);
      setRating(0);
      setReviewText('');
      onSuccess();
      onClose();
    } catch (error: any) {
      ToastService.showError(error.response?.data?.message || Messages.SUBMIT_REVIEW_FAILED);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>{Messages.REVIEW_TITLE}</h2>
          <button className="review-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Star Rating */}
          <div className="review-rating-section">
            <label>{Messages.RATING_LABEL}</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                  title={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
            <span className="rating-value">
              {rating > 0 ? `${rating} ${Messages.OUT_OF_FIVE}` : Messages.NO_RATING_SELECTED}
            </span>
          </div>

          {/* Review Text */}
          <div className="review-text-section">
            <label htmlFor="review-text">{Messages.YOUR_REVIEW_LABEL}</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={handleReviewChange}
              placeholder={Messages.REVIEW_PLACEHOLDER}
              maxLength={MAX_CHARS}
              rows={6}
              className="review-textarea"
            />
            <div className="char-count">
              {reviewText.length} / {MAX_CHARS} {Messages.REVIEW_CHAR_COUNT}
            </div>
          </div>

          {/* Buttons */}
          <div className="review-modal-footer">
            <button
              type="button"
              className="review-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {Messages.CANCEL_BUTTON}
            </button>
            <button
              type="submit"
              className="review-btn-submit"
              disabled={loading || rating === 0 || reviewText.trim().length === 0}
            >
              {loading ? Messages.SUBMITTING_BUTTON : Messages.SUBMIT_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
