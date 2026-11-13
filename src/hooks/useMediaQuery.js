import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches the current viewport
 * @param {string} query - CSS media query (e.g., '(max-width: 640px)')
 * @returns {boolean} - Whether the media query currently matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listen for changes
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
}
