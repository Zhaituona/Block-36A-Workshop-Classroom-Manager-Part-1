import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Save token to localStorage or context for future requests
      localStorage.setItem('token', token);
      
      // Redirect to the main application
      navigate('/');
    } else {
      // Handle error if token is missing
      navigate('/login');
    }
  }, [location, navigate]);

  return <div>Logging in...</div>;
}

export default OAuthSuccess;
