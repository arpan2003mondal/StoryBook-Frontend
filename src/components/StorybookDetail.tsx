import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorybookResponse } from '../model/StorybookResponse';
import { StoryBookService } from '../services/StoryBookService';
import { CartService } from '../services/CartService';
import { WishlistService } from '../services/WishlistService';
import { AuthService } from '../services/AuthService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import AudioPreviewModal from './AudioPreviewModal';
import ReviewModal from './ReviewModal';
import ReviewsList from './ReviewsList';
import '../styles/StorybookDetail.css';

const StorybookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storybook, setStorybook] = useState<StorybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showReviewsList, setShowReviewsList] = useState<boolean>(false);
  const [userIdForReview, setUserIdForReview] = useState<number>(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewBookTitle, setPreviewBookTitle] = useState('');

  useEffect(() => {
    const fetchStorybook = async () => {
      try {
        if (!id) {
          ToastService.showError(Messages.INVALID_STORYBOOK_ID);
          return;
        }
        const data = await StoryBookService.getStorybookById(Number(id));
        setStorybook(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          AuthService.logout();
          navigate('/users/login');
        } else {
          ToastService.showError(err.response?.data?.message || Messages.FAILED_TO_FETCH_STORYBOOK);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStorybook();
  }, [id, navigate]);

  useEffect(() => {
    const userId = AuthService.getUserId();
    if (userId) {
      setUserIdForReview(userId);
    }
  }, []);

  const handleBack = () => {
    navigate('/storybooks');
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      if (!storybook) return;
      
      const response = await CartService.addToCart({
        storybookId: storybook.id,
        quantity: 1
      });
      
      if (response.success) {
        ToastService.showSuccess(response.message);
      } else {
        ToastService.showError(response.message);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        ToastService.showError(err.response?.data?.message || Messages.FAILED_TO_ADD_TO_CART_FALLBACK);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setIsAddingToWishlist(true);
      
      if (!storybook) return;
      
      const response = await WishlistService.addToWishlist({ storyBookId: storybook.id });
      
      // If response has success property, use it; otherwise assume success if no error
      const isSuccess = response.success !== false;
      
      if (isSuccess) {
        ToastService.showSuccess(response.message || Messages.ADD_TO_WISHLIST_SUCCESS);
      } else {
        ToastService.showError(response.message || Messages.ADD_TO_WISHLIST_FAILED);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || Messages.ADD_TO_WISHLIST_FAILED;
        ToastService.showError(errorMsg);
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleListenNow = () => {
    if (storybook?.sampleAudioUrl) {
      setPreviewAudioUrl(storybook.sampleAudioUrl);
      setPreviewBookTitle(storybook.title);
    }
  };

  const handleCloseAudioPreview = () => {
    setPreviewAudioUrl(null);
    setPreviewBookTitle('');
  };

  if (loading) return <div className="loading">{Messages.LOADING_STORYBOOK_DETAILS}</div>;

  if (!storybook) return (
    <div className="detail-container">
      <button onClick={handleBack} className="back-button">← {Messages.BACK_BUTTON}</button>
      <div className="error-banner">{Messages.STORYBOOK_NOT_FOUND}</div>
    </div>
  );

  return (
    <div className="detail-container">
      <button onClick={handleBack} className="back-button">← {Messages.BACK_BUTTON}</button>
      
      <div className="detail-content">
        <div className="detail-cover">
          {storybook.coverImageUrl && (
            <>
              <img src={storybook.coverImageUrl} alt={storybook.title} />
              <button
                className="wishlist-btn-detail"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                title="Add to wishlist"
              >
                <i className="fa-solid fa-heart" style={{ color: 'rgb(177, 151, 252)' }}></i>
              </button>
            </>
          )}
        </div>

        <div className="detail-info">
          <h1>{storybook.title}</h1>
          
          <div className="meta-info">
            <p><strong>{Messages.AUTHOR_LABEL}:</strong> {storybook.authorName}</p>
            <p><strong>{Messages.CATEGORY_LABEL}:</strong> {storybook.categoryName}</p>
            <p><strong>{Messages.PRICE_LABEL}:</strong> <span className="price">${storybook.price}</span></p>
            <p><strong>{Messages.PUBLISHED_LABEL}:</strong> {new Date(storybook.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="description-section">
            <h2>{Messages.DESCRIPTION_LABEL}</h2>
            <p>{storybook.description}</p>
          </div>

          <div className="actions">
            {storybook.sampleAudioUrl && (
              <button
                onClick={handleListenNow}
                className="listen-sample-btn"
              >
                <i className="fas fa-volume-high"></i>
                <span>{Messages.LISTEN_NOW}</span>
              </button>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="add-to-cart-btn"
            >
              <i className="fas fa-cart-shopping"></i>
              <span>{isAddingToCart ? Messages.ADDING_TO_CART : Messages.ADD_TO_CART_BUTTON}</span>
            </button>
          </div>

          {userIdForReview > 0 && (
            <div className="review-buttons-section">
              {/* <button 
                className="btn-write-review"
                onClick={() => setShowReviewModal(true)}
              >
                <i className="fas fa-pen-fancy"></i> {Messages.WRITE_REVIEW}
              </button> */}
              <button 
                className="btn-view-reviews"
                onClick={() => setShowReviewsList(true)}
              >
                <i className="fas fa-comments"></i> {Messages.SHOW_REVIEWS}
              </button>
            </div>
          )}

          {/* <ReviewModal 
            storyBookId={storybook.id}
            userId={userIdForReview}
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => setShowReviewsList(true)}
          /> */}

          <ReviewsList
            storyBookId={storybook.id}
            isOpen={showReviewsList}
            onClose={() => setShowReviewsList(false)}
          />

          <AudioPreviewModal
            isOpen={!!previewAudioUrl}
            audioUrl={previewAudioUrl}
            title={previewBookTitle}
            onClose={handleCloseAudioPreview}
          />
        </div>
      </div>
    </div>
  );
};

export default StorybookDetail;

