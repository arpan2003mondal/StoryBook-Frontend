import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistService } from '../services/WishlistService';
import { WishlistResponseDTO } from '../model/WishlistResponseDTO';
import { WishlistItemDTO } from '../model/WishlistItemDTO';
import { RemoveFromWishlistRequest } from '../model/RemoveFromWishlistRequest';
import { CartService } from '../services/CartService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import { AuthService } from '../services/AuthService';
import '../styles/Wishlist.css';

const MyWishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await WishlistService.getWishlist();
      setWishlist(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || Messages.FAILED_TO_LOAD_WISHLIST;
        ToastService.showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (storybookId: number) => {
    try {
      setRemoving(storybookId);
      const request: RemoveFromWishlistRequest = { storyBookId: storybookId };
      await WishlistService.removeFromWishlist(request);
      ToastService.showSuccess(Messages.REMOVE_FROM_WISHLIST_SUCCESS);
      
      // Update state dynamically without reloading
      if (wishlist) {
        const updatedItems = wishlist.wishlistItems.filter(
          item => item.storybookId !== storybookId
        );
        setWishlist({
          ...wishlist,
          wishlistItems: updatedItems,
          totalItems: updatedItems.length
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || Messages.REMOVE_FROM_WISHLIST_FAILED;
      ToastService.showError(errorMsg);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = async (item: WishlistItemDTO) => {
    try {
      setAddingToCart(item.storybookId);
      const response = await CartService.addToCart({
        storybookId: item.storybookId,
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

  const handleViewDetails = (id: number) => {
    navigate(`/storybooks/${id}`);
  };

  if (loading) return <div className="loading">{Messages.LOADING_WISHLIST}</div>;

  return (
    <div className="wishlist-page-container">
      <header className="wishlist-page-header">
        <h1>
          <i className="fas fa-heart"></i> {Messages.WISHLIST_TITLE}
        </h1>
        <button onClick={() => navigate('/storybooks')} className="continue-shopping-btn">
          <i className="fas fa-shopping-bag"></i> {Messages.CONTINUE_SHOPPING}
        </button>
      </header>

      {!wishlist || wishlist.wishlistItems.length === 0 ? (
        <div className="empty-wishlist-page">
          <i className="fas fa-heart-broken"></i>
          <p>{Messages.WISHLIST_EMPTY}</p>
          <small>{Messages.EMPTY_WISHLIST_MESSAGE}</small>
          <button onClick={() => navigate('/storybooks')} className="start-shopping-btn">
            {Messages.CONTINUE_SHOPPING}
          </button>
        </div>
      ) : (
        <div className="wishlist-page-content">
          <div className="wishlist-info">
            <p>Total Items: <strong>{wishlist.totalItems}</strong></p>
          </div>

          <div className="wishlist-grid">
            {wishlist.wishlistItems.map((item: WishlistItemDTO) => (
              <div key={item.wishlistId} className="wishlist-item-card">
                <div className="wishlist-item-image">
                  {item.coverImageUrl && (
                    <img src={item.coverImageUrl} alt={item.title} />
                  )}
                </div>

                <div className="wishlist-item-details">
                  <h3>{item.title}</h3>
                  <p className="wishlist-author">{item.authorName}</p>
                  <p className="wishlist-category">{item.categoryName}</p>
                  <p className="wishlist-price">${item.price}</p>

                  <div className="wishlist-item-buttons">
                    <button
                      className="btn-view-details"
                      onClick={() => handleViewDetails(item.storybookId)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button
                      className="btn-add-to-cart"
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart === item.storybookId}
                    >
                      <i className="fas fa-cart-shopping"></i> {addingToCart === item.storybookId ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      className="btn-remove-wishlist"
                      onClick={() => handleRemoveFromWishlist(item.storybookId)}
                      disabled={removing === item.storybookId}
                    >
                      <i className="fas fa-trash"></i> {removing === item.storybookId ? 'Removing...' : Messages.REMOVE_BUTTON}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
