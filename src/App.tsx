import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterUser from './components/RegisterUser';
import VerifyEmail from './components/VerifyEmail';
import UserLogin from './components/UserLogin';
import Home from './components/Home';
import Storybooks from './components/Storybooks';
import StorybookDetail from './components/StorybookDetail';
import Cart from './components/Cart';
import Library from './components/Library';
import MyWishlist from './components/MyWishlist';
import ProtectedRoute from './components/ProtectedRoute';
import { setupAxiosInterceptors } from './utils/axiosConfig';
import ChangePassword from './components/ChangePassword';
import ChangeUsername from './components/ChangeUsername';
import UserProfileComponent from './components/UserProfile';
import Toast from './components/Toast';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Setup axios interceptors on app load
    setupAxiosInterceptors();
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Toast />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users/register" element={<RegisterUser />} />
            <Route path="/users/verify-email" element={<VerifyEmail />} />
            <Route path="/users/login" element={<UserLogin />} />
            <Route path="/users/forgot-password" element={<ForgotPassword />} />
            <Route path="/users/reset-password" element={<ResetPassword />} />
            <Route path="/users/change-password" element={<ProtectedRoute element={<ChangePassword />} />} />
            <Route path="/users/change-username" element={<ProtectedRoute element={<ChangeUsername />} />} />
            <Route path="/storybooks" element={<ProtectedRoute element={<Storybooks />} />} />
            <Route path="/storybooks/:id" element={<ProtectedRoute element={<StorybookDetail />} />} />
            <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
            <Route path="/library" element={<ProtectedRoute element={<Library />} />} />
            <Route path="/wishlist" element={<ProtectedRoute element={<MyWishlist />} />} />
            <Route path="/users/profile" element={<ProtectedRoute element={<UserProfileComponent />} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

