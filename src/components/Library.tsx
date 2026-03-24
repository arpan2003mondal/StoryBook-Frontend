import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserService } from '../services/UserService';
import { StorybookResponse } from '../model/StorybookResponse';
import { AuthService } from '../services/AuthService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import AudioPlayer from './AudioPlayer';
import '../styles/Library.css';

const Library = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [library, setLibrary] = useState<StorybookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLibrary();
  }, [location]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const data = await UserService.getUserLibrary();
      setLibrary(data);
      
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || Messages.PROFILE_LOAD_FAILED;
        ToastService.showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewStorybook = (storybookId: number | string) => {
    navigate(`/storybooks/${storybookId}`);
  };

  if (loading) return <div className="loading">{Messages.LIBRARY_LOADING}</div>;

  return (
    <div className="library-container">
      <header className="library-header">
        <h1>
          <i className="fas fa-book-open"></i> {Messages.MY_LIBRARY}
        </h1>
        <button onClick={() => navigate('/storybooks')} className="shop-button">
          <i className="fas fa-shopping-bag"></i> {Messages.CONTINUE_SHOPPING}
        </button>
      </header>

      {library && library.length > 0 ? (
        <div className="library-content">
          <div className="library-info">
            <p>Total Books: <strong>{library.length}</strong></p>
            <div className="filter-section">
              <label htmlFor="filter">
                <i className="fas fa-filter"></i> {Messages.FILTER}:
              </label>
              <select 
                id="filter"
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="all">{Messages.ALL_BOOKS}</option>
                <option value="recent">{Messages.RECENTLY_PURCHASED}</option>
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
                      <span>{Messages.NO_IMAGE}</span>
                    </div>
                  )}
                  <div className="item-overlay">
                    <button 
                      className="read-button"
                      onClick={() => handleViewStorybook(item.id)}
                    >
                      <i className="fas fa-book-reader"></i> Read
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
                      <i className="fas fa-book-reader"></i> Read
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
          <div className="empty-icon">
            <i className="fas fa-bookmark"></i>
          </div>
          <h2>{Messages.MY_LIBRARY}</h2>
          <p>{Messages.EMPTY_CART_MESSAGE}</p>
          <p>Start exploring and add some stories to your collection!</p>
          <button onClick={() => navigate('/storybooks')} className="shop-button">
            <i className="fas fa-shopping-bag"></i> {Messages.START_SHOPPING}
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
