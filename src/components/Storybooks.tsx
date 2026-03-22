import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { CartService } from '../services/CartService';
import { StoryBookService } from '../services/StoryBookService';
import { StorybookResponse } from '../model/StorybookResponse';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewBookTitle, setPreviewBookTitle] = useState('');

  useEffect(() => {
    fetchAllStorybooks();
  }, [navigate]);

  const fetchAllStorybooks = async () => {
    try {
      setLoading(true);
      const data = await StoryBookService.getAllStorybooks();
      setStorybooks(data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch storybooks');
      }
    } finally {
      setLoading(false);
    }
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
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to search storybooks');
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
      setError('');

      const response = await CartService.addToCart({
        storybookId: book.id,
        quantity: 1
      });

      setSuccessMessage(`${book.title} added to cart!`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to add to cart');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
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

  if (loading) return <div className="loading">Loading storybooks...</div>;

  return (
    <div className="storybooks-container">
      <header className="storybooks-header">

        {successMessage && <div className="success-message">{successMessage}</div>}
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search storybooks by title, author, or keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" disabled={isSearching} className="search-button">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-button"
            >
              Clear
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
              <p className="description">{book.description}</p>
              <div className="book-footer">
                <span className="price">${book.price}</span>
                <span className="created-date">
                  {new Date(book.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="card-actions">
                {book.sampleAudioUrl && (
                  <button
                    className="audio-link"
                    onClick={(e) => handleListenNow(e, book)}
                    title="Preview sample audio"
                  >
                    🎧 Listen Now
                  </button>
                )}
                <button
                  onClick={(e) => handleAddToCart(e, book)}
                  disabled={addingToCart === book.id}
                  className="add-to-cart-quick-btn"
                >
                  {addingToCart === book.id ? 'Adding...' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">
            {searchKeyword ? 'No storybooks found matching your search.' : 'No storybooks available'}
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
