import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MicrosoftAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Wait for router to be ready and query params to be available
    if (!router.isReady) return;

    // Get URL parameters from Next.js router
    const { code, state, error } = router.query;
    
    // Check for errors
    if (error) {
      console.error('OAuth error:', error);
      router.push('/');
      return;
    }
    
    // Verify state to prevent CSRF
    const storedState = localStorage.getItem('microsoftOAuthState');
    if (state !== storedState) {
      console.error('State validation failed');
      router.push('/');
      return;
    }
    
    // Clear state from storage
    localStorage.removeItem('microsoftOAuthState');
    
    if (code) {
        // First set the flag
        localStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('triggerInfrastructureAnalysis', 'true');
        console.log('Set triggerInfrastructureAnalysis flag to true');
        
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          // Then redirect
          router.push('/demo');
        }, 300);
      } else {
        router.push('/');
      }
  }, [router.isReady, router.query, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication, please wait...</p>
      </div>
    </div>
  );
}