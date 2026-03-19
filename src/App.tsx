import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterUser from './components/RegisterUser';
import UserLogin from './components/UserLogin';
import Home from './components/Home';
import Storybooks from './components/Storybooks';
import StorybookDetail from './components/StorybookDetail';
import Cart from './components/Cart';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthService } from './services/AuthService';

function App() {
  useEffect(() => {
    // Initialize JWT token on app load
    AuthService.initializeToken();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/storybooks" element={<ProtectedRoute element={<Storybooks />} />} />
        <Route path="/storybooks/:id" element={<ProtectedRoute element={<StorybookDetail />} />} />
        <Route path="/cart" element={<ProtectedRoute element={<Cart />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

