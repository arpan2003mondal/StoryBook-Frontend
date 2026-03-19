import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorybookResponse } from '../model/StorybookResponse';
import { StoryBookService } from '../services/StoryBookService';
import { CartService } from '../services/CartService';
import { AuthService } from '../services/AuthService';
import '../styles/StorybookDetail.css';

const StorybookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storybook, setStorybook] = useState<StorybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchStorybook = async () => {
      try {
        if (!id) {
          setError('Invalid storybook ID');
          return;
        }
        const data = await StoryBookService.getStorybookById(Number(id));
        setStorybook(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          AuthService.logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch storybook details');
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
      setError('');
      
      if (!storybook) return;
      
      const response = await CartService.addToCart({
        storybookId: storybook.id,
        quantity: quantity
      });
      
      setSuccessMessage(response.message || 'Added to cart successfully!');
      setQuantity(1);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to add to cart');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  if (loading) return <div className="loading">Loading storybook details...</div>;

  if (error) return (
    <div className="detail-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <div className="error-banner">{error}</div>
    </div>
  );

  if (!storybook) return (
    <div className="detail-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <div className="error-banner">Storybook not found</div>
    </div>
  );

  return (
    <div className="detail-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      
      <div className="detail-content">
        <div className="detail-cover">
          {storybook.coverImageUrl && (
            <img src={storybook.coverImageUrl} alt={storybook.title} />
          )}
        </div>

        <div className="detail-info">
          <h1>{storybook.title}</h1>
          
          <div className="meta-info">
            <p><strong>Author:</strong> {storybook.authorName}</p>
            <p><strong>Category:</strong> {storybook.categoryName}</p>
            <p><strong>Price:</strong> <span className="price">${storybook.price}</span></p>
            <p><strong>Published:</strong> {new Date(storybook.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="description-section">
            <h2>Description</h2>
            <p>{storybook.description}</p>
          </div>

          <div className="actions">
            <div className="quantity-section">
              <label htmlFor="quantity">Quantity:</label>
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
              {isAddingToCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            
            <button onClick={handleViewCart} className="view-cart-btn">
              View Cart
            </button>

            {storybook.audioUrl && (
              <a href={storybook.audioUrl} target="_blank" rel="noopener noreferrer" className="audio-button">
                🎧 Listen Now
              </a>
            )}
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="error-banner">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default StorybookDetail;
