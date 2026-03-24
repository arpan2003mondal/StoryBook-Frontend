import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorybookResponse } from '../model/StorybookResponse';
import { StoryBookService } from '../services/StoryBookService';
import { CartService } from '../services/CartService';
import { AuthService } from '../services/AuthService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import '../styles/StorybookDetail.css';

const StorybookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storybook, setStorybook] = useState<StorybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const handleBack = () => {
    navigate('/storybooks');
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      if (!storybook) return;
      
      const response = await CartService.addToCart({
        storybookId: storybook.id,
        quantity: quantity
      });
      
      if (response.success) {
        ToastService.showSuccess(response.message);
      } else {
        ToastService.showError(response.message);
      }
      setQuantity(1);
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

  const handleViewCart = () => {
    navigate('/cart');
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
            <img src={storybook.coverImageUrl} alt={storybook.title} />
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
            <div className="quantity-section">
              <label htmlFor="quantity">{Messages.QUANTITY_LABEL}:</label>
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="add-to-cart-btn"
            >
              {isAddingToCart ? Messages.ADDING_TO_CART : '🛒 ' + Messages.ADD_TO_CART_BUTTON}
            </button>
            
            <button onClick={handleViewCart} className="view-cart-btn">
              {Messages.VIEW_CART}
            </button>

            {storybook.audioUrl && (
              <a href={storybook.audioUrl} target="_blank" rel="noopener noreferrer" className="audio-button">
                🎧 {Messages.LISTEN_NOW}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorybookDetail;

