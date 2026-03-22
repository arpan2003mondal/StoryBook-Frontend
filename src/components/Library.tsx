import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { StorybookResponse } from '../model/StorybookResponse';
import { AuthService } from '../services/AuthService';
import AudioPlayer from './AudioPlayer';
import '../styles/Library.css';

const Library = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [library, setLibrary] = useState<StorybookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLibrary();
  }, [location]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUserLibrary();
      setLibrary(data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch library';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewStorybook = (storybookId: number | string) => {
    navigate(`/storybooks/${storybookId}`);
  };

  if (loading) return <div className="loading">Loading your library...</div>;

  return (
    <div className="library-container">
      <header className="library-header">
        <h1>My Library</h1>
        <button onClick={() => navigate('/storybooks')} className="shop-button">
          Continue Shopping
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {library && library.length > 0 ? (
        <div className="library-content">
          <div className="library-info">
            <p>Total Books: <strong>{library.length}</strong></p>
            <div className="filter-section">
              <label htmlFor="filter">Filter: </label>
              <select 
                id="filter"
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="all">All Books</option>
                <option value="recent">Recently Purchased</option>
              </select>
            </div>
          </div>

          <div className="library-grid">
            {library.map(item => (
              <div key={item.id} className="library-item">
                <div className="item-cover-wrapper">
                  {item.coverImageUrl ? (
                    <img 
                      src={item.coverImageUrl} 
                      alt={item.title}
                      className="item-cover"
                    />
                  ) : (
                    <div className="item-cover-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="item-overlay">
                    <button 
                      className="read-button"
                      onClick={() => handleViewStorybook(item.id)}
                    >
                      📖 Read
                    </button>
                  </div>
                </div>

                <div className="item-info">
                  <h3>{item.title}</h3>
                  <p className="author">{item.authorName}</p>
                  <p className="category">{item.categoryName}</p>

                  <div className="item-actions">
                    <button 
                      className="action-button read-action"
                      onClick={() => handleViewStorybook(item.id)}
                      title="Read this story"
                    >
                      📖 Read
                    </button>
                  </div>

                  <AudioPlayer audioUrl={item.audioUrl} title={item.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-library">
          <div className="empty-icon">📚</div>
          <h2>Your library is empty</h2>
          <p>You haven't purchased any storybooks yet.</p>
          <p>Start exploring and add some stories to your collection!</p>
          <button onClick={() => navigate('/storybooks')} className="shop-button">
            Start Shopping Now
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
