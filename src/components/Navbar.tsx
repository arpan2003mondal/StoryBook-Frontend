import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { CartService } from '../services/CartService';
import { UserProfile } from '../model/UserProfile';
import { ToastService } from '../services/ToastService';
import '../styles/Navbar.css';
import { WalletBalanceDTO } from '../model/WalletBalanceDTO';
import { CartResponseDTO } from '../model/CartResponseDTO';
import { Messages } from '../messages/messages';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceDTO | null>(null);
  const [cartItems, setCartItems] = useState<CartResponseDTO | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Don't show navbar on auth pages
  const hideNavbar =
    location.pathname === '/users/login' ||
    location.pathname === '/users/register' ||
    location.pathname === '/';

  useEffect(() => {
    if (!hideNavbar) {
      checkAuthentication();
    }
  }, [location, hideNavbar]);

  // Subscribe to cart updates
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = CartService.subscribe((updatedCart) => {
        setCartItems(updatedCart);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    const isAuth = AuthService.isAuthenticated();
    setIsAuthenticated(isAuth);

    if (isAuth) {
      try {
        const profile = await UserService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        ToastService.showError(Messages.PROFILE_LOAD_FAILED);
      }

      try {
        const balance = await UserService.getWalletBalance();
        setWalletBalance(balance);
      } catch (error) {
        // Silently handle wallet balance load errors
        // User can see balance on profile/cart pages if needed
      }

      // Fetch cart and subscribe to updates
      try {
        const cartResponse = await CartService.getCart();
        if (cartResponse.success && cartResponse.data) {
          setCartItems(cartResponse.data);
        }
      } catch (error) {
        // Cart fetch error - cart may be empty on first load
      }
    }
  };



  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/users/profile');
    setUserMenuOpen(false);
  };

  const handleLibrary = () => {
    navigate('/library');
    setUserMenuOpen(false);
  };

  const handleCart = () => {
    navigate('/cart');
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    navigate('/storybooks');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleHome = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/users/login');
    setMobileMenuOpen(false);
  };

  if (hideNavbar) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={handleDashboard} title="Go to Dashboard">
          <i className="fas fa-book-open logo-icon"></i>
          <span className="logo-text">StoryBook</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
        </button>

        {/* Navigation Items */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            // Unauthenticated Menu
            <div className="nav-items">
              <button
                className="nav-button signin-btn"
                onClick={() => {
                  navigate('/users/login');
                  setMobileMenuOpen(false);
                }}
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>{Messages.SIGN_IN}</span>
              </button>
              <button
                className="nav-button signup-btn"
                onClick={() => {
                  navigate('/users/register');
                  setMobileMenuOpen(false);
                }}
              >
                <i className="fas fa-user-plus"></i>
                <span>{Messages.SIGN_UP}</span>
              </button>
            </div>
          ) : (
            // Authenticated Menu
            <div className="nav-items authenticated">
              {/* Cart Button with Badge */}
              <div className="cart-wrapper">
                <button className="nav-icon-btn cart-btn" onClick={handleCart} title="Shopping Cart" aria-label="Shopping Cart">
                  <i className="fas fa-shopping-cart"></i>
                  <span className="cart-label">{Messages.CART_NAV}</span>
                </button>
                {cartItems && cartItems.totalItems > 0 && (
                  <span className="cart-badge">{cartItems.totalItems}</span>
                )}
              </div>

              {/* Library Button */}
              <button className="nav-icon-btn library-btn" onClick={handleLibrary} title="My Library" aria-label="My Library">
                <i className="fas fa-book"></i>
                <span className="library-label">{Messages.LIBRARY_NAV}</span>
              </button>

              {/* Wallet Balance */}
              <div className="wallet-section">
                <i className="fas fa-wallet wallet-icon"></i>
                <span className="wallet-amount">${walletBalance?.balance?.toFixed(2)}</span>
              </div>

              {/* User Profile Dropdown */}
              <div className="user-profile-section">
                <button
                  className="user-profile-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  <div className="user-avatar">{userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                  <span className="user-name">{userProfile?.name?.split(' ')[0] || 'User'}</span>
                  <i className={`fas fa-chevron-down dropdown-arrow ${userMenuOpen ? 'open' : ''}`}></i>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="user-email">{userProfile?.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={handleProfile}>
                      <i className="fas fa-user"></i>
                      <span>{Messages.MY_PROFILE}</span>
                    </button>
                    {/* <button className="dropdown-item" onClick={handleLibrary}>
                      <i className="fas fa-solid fa-book"></i>
                      <span>{Messages.MY_LIBRARY}</span>
                    </button> */}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>{Messages.LOGOUT}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
