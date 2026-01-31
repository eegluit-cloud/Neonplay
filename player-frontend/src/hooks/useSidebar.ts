import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar state.
 * On mobile (< 1024px), sidebar starts closed.
 * On desktop (>= 1024px), sidebar starts open.
 */
export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if we're on the server or if window is not available
    if (typeof window === 'undefined') return false;
    // Start closed on mobile, open on desktop
    return window.innerWidth >= 1024;
  });

  // Ensure sidebar is closed on mobile after mount
  useEffect(() => {
    const handleResize = () => {
      // Automatically close sidebar when resizing to mobile
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    // Run once on mount to ensure correct initial state
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
  };
}
