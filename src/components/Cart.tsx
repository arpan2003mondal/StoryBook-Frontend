import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartResponseDTO } from '../model/CartResponseDTO';
import { OrderResponseDTO } from '../model/OrderResponseDTO';
import { CartService } from '../services/CartService';
import { AuthService } from '../services/AuthService';
import { ToastService } from '../services/ToastService';
import { Messages } from '../messages/messages';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<OrderResponseDTO | null>(null);

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await CartService.getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        ToastService.showError(response.message || Messages.GET_CART_FAILED);
        setCart(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || Messages.GET_CART_FAILED;
        ToastService.showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      setIsRemoving(cartItemId);
      const response = await CartService.removeFromCart(cartItemId);
      
      if (response.success && response.data) {
        setCart(response.data);
        ToastService.showSuccess(response.message);
      } else {
        ToastService.showError(response.message || Messages.REMOVE_FROM_CART_FAILED);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || Messages.REMOVE_FROM_CART_FAILED;
        ToastService.showError(errorMsg);
      }
    } finally {
      setIsRemoving(null);
    }
  };

  const handleContinueShopping = () => {
    navigate('/storybooks');
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const response = await CartService.checkout();
      
      if (response.success && response.data) {
        ToastService.showSuccess(response.message);
        setCheckoutSuccess(response.data);
        setCart(null); // Clear cart after successful checkout
      } else {
        ToastService.showError(response.message || Messages.CHECKOUT_FAILED);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/users/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || Messages.CHECKOUT_FAILED;
        ToastService.showError(errorMsg);
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="loading">{Messages.LOADING_CART}</div>;

  // Show success message after checkout
  if (checkoutSuccess) {
    return (
      <div className="cart-container">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h1>{Messages.ORDER_PLACED_SUCCESS}</h1>
          <div className="success-details">
            <p className="order-id">{Messages.ORDER_ID_LABEL}: <strong>#{checkoutSuccess.orderId}</strong></p>
            <p className="order-amount">Total Amount: <strong>${typeof checkoutSuccess.totalAmount === 'number' ? checkoutSuccess.totalAmount.toFixed(2) : '0.00'}</strong></p>
            <p className="order-items">{Messages.ORDER_ITEMS_LABEL}: <strong>{checkoutSuccess.itemCount}</strong></p>
            <p className="order-date">Order Date: <strong>{new Date(checkoutSuccess.createdAt).toLocaleDateString()}</strong></p>
            <p className="order-status">Status: <strong>{checkoutSuccess.orderStatus}</strong></p>
          </div>
          <div className="success-message">
            <p>{Messages.THANK_YOU_MESSAGE}</p>
          </div>
          <div className="success-actions">
            <button onClick={() => navigate('/storybooks')} className="continue-button">
              {Messages.CONTINUE_SHOPPING}
            </button>
            <button onClick={() => navigate('/library')} className="library-button">
              {Messages.GO_TO_LIBRARY}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>{Messages.CART_TITLE}</h1>
       
      </header>

      {cart && cart.cartItems && cart.cartItems.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            <h2>{Messages.CART_ITEMS_LABEL} ({cart.cartItems.length})</h2>
            
            <div className="items-list">
              {cart.cartItems.map(item => {
                return (
                  <div key={item.id} className="cart-item">
                    {item.coverImageUrl && (
                      <img src={item.coverImageUrl} alt={item.title} className="item-cover-image" />
                    )}
                    <div className="item-details">
                      <h3>{item.title || Messages.UNKNOWN_BOOK}</h3>
                      <p className="item-meta">
                        <span className="author">{item.authorName || Messages.UNKNOWN_AUTHOR}</span>
                        <span className="category">{item.categoryName || Messages.UNKNOWN_CATEGORY}</span>
                      </p>
                    </div>
                    
                    <div className="item-total">
                      <p className="total-price">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving === item.id}
                        className="remove-button"
                      >
                        {isRemoving === item.id ? Messages.REMOVING_ITEM : Messages.REMOVE_ITEM}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary">
            <h2>{Messages.ORDER_SUMMARY_LABEL}</h2>
            <div className="summary-line">
              <span>{Messages.SUBTOTAL_LABEL}:</span>
              <span>${typeof cart.totalPrice === 'number' ? cart.totalPrice.toFixed(2) : '0.00'}</span>
            </div>
            <div className="summary-line">
              <span>{Messages.SHIPPING_LABEL}:</span>
              <span>{Messages.SHIPPING_FREE}</span>
            </div>
            <div className="summary-line">
              <span>{Messages.TAX_LABEL}:</span>
              <span>{Messages.TAX_AT_CHECKOUT}</span>
            </div>
            <div className="summary-total">
              <span>{Messages.TOTAL_LABEL}:</span>
              <span>${typeof cart.totalPrice === 'number' ? cart.totalPrice.toFixed(2) : '0.00'}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={isCheckingOut || !cart || cart.cartItems.length === 0}
              className="checkout-button"
            >
              {isCheckingOut ? Messages.PROCESSING_CHECKOUT : Messages.PROCEED_TO_CHECKOUT}
            </button>
            <button onClick={handleContinueShopping} className="continue-shopping-button">
              {Messages.CONTINUE_SHOPPING}
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <h2>{Messages.CART_EMPTY}</h2>
          <p>{Messages.EMPTY_CART_MESSAGE}</p>
          <button onClick={handleContinueShopping} className="shop-button">
            {Messages.START_SHOPPING}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
