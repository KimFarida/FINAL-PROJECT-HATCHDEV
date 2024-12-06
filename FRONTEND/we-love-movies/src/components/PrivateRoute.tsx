import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken'); 

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

export default PrivateRoute;
