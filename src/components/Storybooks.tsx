import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { CartService } from '../services/CartService';
import { StoryBookService } from '../services/StoryBookService';
import { ReviewService } from '../services/ReviewService';
import { WishlistService } from '../services/WishlistService';
import { StorybookResponse } from '../model/StorybookResponse';
import { AverageRatingResponse } from '../model/ReviewSubmitRequest';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import '../styles/Storybooks.css';

const Storybooks = () => {
  const navigate = useNavigate();
  const [storybooks, setStorybooks] = useState<StorybookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: AverageRatingResponse }>({});
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);

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
    
    // Fetch all ratings in parallel instead of sequentially
    const ratingPromises = books.map(book =>
      ReviewService.getAverageRating(book.id)
        .then(rating => {
          ratingsMap[book.id] = rating;
        })
        .catch(err => {
          ToastService.showError(err.response?.data?.message || Messages.FAILED_TO_FETCH_REVIEWS);
        })
    );
    
    // Wait for all rating fetches to complete
    await Promise.all(ratingPromises);
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

  const handleAddToWishlist = async (e: React.MouseEvent, book: StorybookResponse) => {
    e.stopPropagation();
    
    try {
      setAddingToWishlist(book.id);
      const response = await WishlistService.addToWishlist({ storyBookId: book.id });
      
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
      setAddingToWishlist(null);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/users/login');
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
                <div className="book-cover-wrapper">
                  <img src={book.coverImageUrl} alt={book.title} className="book-cover" />
                  <button
                    className="wishlist-btn"
                    onClick={(e) => handleAddToWishlist(e, book)}
                    disabled={addingToWishlist === book.id}
                    title="Add to wishlist"
                  >
                    <i className="fa-solid fa-heart" style={{ color: 'rgb(177, 151, 252)' }}></i>
                  </button>
                </div>
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

    </div>
  );
};

export default Storybooks;
