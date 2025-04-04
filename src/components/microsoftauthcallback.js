// MicrosoftAuthCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MicrosoftAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');
    const error = queryParams.get('error');
    
    // Check for errors
    if (error) {
      console.error('OAuth error:', error);
      navigate('/'); // Redirect to home page
      return;
    }
    
    // Verify state to prevent CSRF
    const storedState = localStorage.getItem('microsoftOAuthState');
    if (state !== storedState) {
      console.error('State validation failed');
      navigate('/');
      return;
    }
    
    // Clear state from storage
    localStorage.removeItem('microsoftOAuthState');
    
    if (code) {
      // Here you would typically send the code to your backend to exchange for tokens
      // For demo purposes, we'll simulate a successful login
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store user is authenticated in sessionStorage
      sessionStorage.setItem('userAuthenticated', 'true');
      
      // Redirect back to the application with a flag to trigger the infrastructure analysis
      navigate('/?startAnalysis=true');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication, please wait...</p>
      </div>
    </div>
  );
}

export default MicrosoftAuthCallback;