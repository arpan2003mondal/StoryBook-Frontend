import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartResponseDTO } from '../model/CartResponseDTO';
import { CartService } from '../services/CartService';
import { AuthService } from '../services/AuthService';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await CartService.getCart();
      setCart(data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch cart';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      setIsRemoving(cartItemId);
      const response = await CartService.removeFromCart(cartItemId);
      // response might be { message, cart } or just cart data
      const updatedCart = response.cart || response;
      setCart(updatedCart);
    } catch (err: any) {
      if (err.response?.status === 401) {
        AuthService.logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to remove item');
      }
    } finally {
      setIsRemoving(null);
    }
  };

  const handleContinueShopping = () => {
    navigate('/storybooks');
  };

  const handleCheckout = () => {
    // TODO: Implement checkout
    alert('Checkout functionality coming soon!');
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Shopping Cart</h1>
        <button onClick={() => navigate('/storybooks')} className="back-button">
          ← Continue Shopping
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {cart && cart.cartItems && cart.cartItems.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            <h2>Cart Items ({cart.cartItems.length})</h2>
            
            <div className="items-list">
              {cart.cartItems.map(item => {
                return (
                  <div key={item.id} className="cart-item">
                    {item.coverImageUrl && (
                      <img src={item.coverImageUrl} alt={item.title} className="item-cover-image" />
                    )}
                    <div className="item-details">
                      <h3>{item.title || 'Unknown Book'}</h3>
                      <p className="item-meta">
                        <span className="author">{item.authorName || 'Unknown Author'}</span>
                        <span className="category">{item.categoryName || 'Unknown Category'}</span>
                      </p>
                    </div>
                    
                    <div className="item-total">
                      <p className="total-price">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving === item.id}
                        className="remove-button"
                      >
                        {isRemoving === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${typeof cart.totalPrice === 'number' ? cart.totalPrice.toFixed(2) : '0.00'}</span>
            </div>
            <div className="summary-line">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-line">
              <span>Tax:</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>${typeof cart.totalPrice === 'number' ? cart.totalPrice.toFixed(2) : '0.00'}</span>
            </div>

            <button onClick={handleCheckout} className="checkout-button">
              Proceed to Checkout
            </button>
            <button onClick={handleContinueShopping} className="continue-shopping-button">
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Start adding some stories to your cart!</p>
          <button onClick={handleContinueShopping} className="shop-button">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
