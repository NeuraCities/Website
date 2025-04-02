'use client';

import { useEffect } from 'react';

export default function ViewportHeightFix() {
  useEffect(() => {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  
    // We listen to the resize event
    const handleResize = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null; // This component doesn't render anything
}