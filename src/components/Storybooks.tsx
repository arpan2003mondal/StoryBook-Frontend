import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { CartService } from '../services/CartService';
import { StoryBookService } from '../services/StoryBookService';
import { ReviewService } from '../services/ReviewService';
import { StorybookResponse } from '../model/StorybookResponse';
import { AverageRatingResponse } from '../model/ReviewSubmitRequest';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import AudioPreviewModal from './AudioPreviewModal';
import '../styles/Storybooks.css';

const Storybooks = () => {
  const navigate = useNavigate();
  const [storybooks, setStorybooks] = useState<StorybookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewBookTitle, setPreviewBookTitle] = useState('');
  const [ratings, setRatings] = useState<{ [key: number]: AverageRatingResponse }>({});

  useEffect(() => {
    fetchAllStorybooks();
  }, [navigate]);

  const fetchAllStorybooks = async () => {
    try {
      setLoading(true);
      const data = await StoryBookService.getAllStorybooks();
      setStorybooks(data);
      setError('');
      fetchRatingsForBooks(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || Messages.FAILED_TO_FETCH_STORYBOOKS;
        setError(errorMsg);
        ToastService.showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingsForBooks = async (books: StorybookResponse[]) => {
    const ratingsMap: { [key: number]: AverageRatingResponse } = {};
    for (const book of books) {
      try {
        const rating = await ReviewService.getAverageRating(book.id);
        ratingsMap[book.id] = rating;
      } catch (err) {
        console.error(`Failed to fetch rating for book ${book.id}`);
      }
    }
    setRatings(ratingsMap);
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      fetchAllStorybooks();
      return;
    }

    try {
      setIsSearching(true);
      const data = await StoryBookService.searchStorybooks(searchKeyword);
      setStorybooks(data);
      setError('');
      fetchRatingsForBooks(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || Messages.FAILED_TO_SEARCH_STORYBOOKS;
        setError(errorMsg);
        ToastService.showError(errorMsg);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    fetchAllStorybooks();
  };

  const handleViewDetails = (id: number) => {
    navigate(`/storybooks/${id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent, book: StorybookResponse) => {
    e.stopPropagation();
    try {
      setAddingToCart(book.id);
      const response = await CartService.addToCart({
        storybookId: book.id,
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
        const errorMsg = err.response?.data?.message || Messages.FAILED_TO_ADD_TO_CART_FALLBACK;
        ToastService.showError(errorMsg);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/users/login');
  };

  const handleListenNow = (e: React.MouseEvent, book: StorybookResponse) => {
    e.stopPropagation();
    setPreviewAudioUrl(book.sampleAudioUrl || null);
    setPreviewBookTitle(book.title);
  };

  const handleCloseAudioPreview = () => {
    setPreviewAudioUrl(null);
    setPreviewBookTitle('');
  };

  if (loading) return <div className="loading">{Messages.LOADING_STORYBOOKS}</div>;

  return (
    <div className="storybooks-container">
      <header className="storybooks-header">

      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder={Messages.SEARCH_PLACEHOLDER}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
            required
          />
          <button type="submit" disabled={isSearching} className="search-button">
            {isSearching ? Messages.SEARCHING : Messages.SEARCH_BUTTON}
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-button"
            >
              {Messages.CLEAR_BUTTON}
            </button>
          )}
        </form>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="storybooks-grid">
        {storybooks.length > 0 ? (
          storybooks.map(book => (
            <div
              key={book.id}
              className="storybook-card"
              onClick={() => handleViewDetails(book.id)}
            >
              {book.coverImageUrl && (
                <img src={book.coverImageUrl} alt={book.title} className="book-cover" />
              )}
              <h3>{book.title}</h3>
              <p className="author">by {book.authorName}</p>
              <p className="category">{book.categoryName}</p>
              {/* <p className="description">{book.description}</p> */}
              <div className="book-footer">
                <span className="price">${book.price}</span>
                <div className="rating-display">
                  {ratings[book.id] && ratings[book.id].totalReviews > 0 ? (
                    <>
                      <span className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star ${star <= Math.round(ratings[book.id].averageRating) ? 'filled' : 'empty'}`}
                          ></i>
                        ))}
                      </span>
                      <span className="rating-value">{ratings[book.id].averageRating.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="no-rating">{Messages.NO_RATING}</span>
                  )}
                </div>
              </div>

              <div className="card-actions">
                {book.sampleAudioUrl && (
                  <button
                    className="audio-link"
                    onClick={(e) => handleListenNow(e, book)}
                    title="Preview sample audio"
                  >
                    <i className="fas fa-volume-high"></i> Preview Story
                  </button>
                )}
                <button
                  onClick={(e) => handleAddToCart(e, book)}
                  disabled={addingToCart === book.id}
                  className="add-to-cart-quick-btn"
                >
                  <i className="fas fa-cart-shopping"></i> {addingToCart === book.id ? Messages.ADDING_TO_CART : Messages.ADD_TO_CART_BUTTON}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">
            {searchKeyword ? Messages.NO_STORYBOOKS_FOUND : Messages.NO_STORYBOOKS_AVAILABLE}
          </p>
        )}
      </div>

      <AudioPreviewModal
        isOpen={!!previewAudioUrl}
        audioUrl={previewAudioUrl}
        title={previewBookTitle}
        onClose={handleCloseAudioPreview}
      />
    </div>
  );
};

export default Storybooks;
