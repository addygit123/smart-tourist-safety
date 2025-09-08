import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Our security guard checks for the token in localStorage.
  const token = localStorage.getItem('authToken');

  if (!token) {
    // If there's no token, the user is not logged in.
    // We redirect them to the login page.
    // The 'replace' prop is important to prevent weird back-button behavior.
    return <Navigate to="/login" replace />;
  }

  // If there is a token, the user is logged in.
  // We allow them to see the component they were trying to access.
  return children;
};

export default ProtectedRoute;