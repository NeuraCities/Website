"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchParamsWrapper({ onSourceChange }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const source = searchParams.get('source');
    if (source) {
      onSourceChange(source);
    }
  }, [searchParams, onSourceChange]);
  
  return null;
}