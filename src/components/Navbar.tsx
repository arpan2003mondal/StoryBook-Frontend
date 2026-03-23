import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { UserService, UserProfile } from '../services/UserService';
import '../styles/Navbar.css';
import { WalletBalanceDTO } from '../model/WalletBalanceDTO';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalanceDTO | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Don't show navbar on auth pages
  const hideNavbar =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/';

  useEffect(() => {
    checkAuthentication();
  }, [location]);

  const checkAuthentication = async () => {
    const isAuth = AuthService.isAuthenticated();
    setIsAuthenticated(isAuth);

    if (isAuth) {
      try {
        const profile = await UserService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }

      try {
        const balance = await UserService.getWalletBalance();
       
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
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
    navigate('/wallet/library');
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

  if (hideNavbar) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={handleDashboard}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">StoryBook</span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation Items */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            // Unauthenticated Menu
            <div className="nav-items">
              <button
                className="nav-button signin-btn"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </button>
              <button
                className="nav-button signup-btn"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </button>
            </div>
          ) : (
            // Authenticated Menu
            <div className="nav-items authenticated">
              {/* Cart Icon */}
              <button className="nav-icon-btn cart-btn" onClick={handleCart} title="Cart">
                <span className="cart-icon">🛒</span>
                <span className="cart-label">Cart</span>
              </button>

              {/* Library Icon */}
              <button className="nav-icon-btn library-btn" onClick={handleLibrary} title="My Library">
                <span className="library-icon">📖</span>
                <span className="library-label">Library</span>
              </button>

              {/* Wallet Balance */}
              <div className="wallet-section">
                <span className="wallet-icon">💰</span>
                <span className="wallet-amount">${walletBalance?.balance?.toFixed(2)}</span>
              </div>

              {/* User Profile Dropdown */}
              <div className="user-profile-section">
                <button
                  className="user-profile-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="user-avatar">{userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  <span className="user-name">{userProfile?.name?.split(' ')[0] || 'User'}</span>
                  <span className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`}>▼</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="user-email">{userProfile?.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={handleProfile}>
                      <span>👤</span> My Profile
                    </button>
                    <button className="dropdown-item" onClick={handleLibrary}>
                      <span>📚</span> My Library
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <span>🚪</span> Logout
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
