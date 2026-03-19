import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  return AuthService.isAuthenticated() ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
