'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'green' | 'orange';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'green',
  setTheme: () => {},
  isLoading: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ 
  children, 
  initialTheme 
}: { 
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Priority: Server theme > localStorage > default
    if (initialTheme) {
      return initialTheme;
    }
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme === 'green' || savedTheme === 'orange') {
        return savedTheme;
      }
    }
    return 'green';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync localStorage with server theme on mount
  useEffect(() => {
    if (initialTheme && typeof window !== 'undefined') {
      localStorage.setItem('theme', initialTheme);
    }
  }, [initialTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Sync to database
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!response.ok) {
        console.error('Failed to sync theme to server');
      }
    } catch (error) {
      console.error('Error syncing theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}
