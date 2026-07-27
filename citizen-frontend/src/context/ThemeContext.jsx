import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('civicpulse_theme') || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState('light');

  const applyTheme = (t) => {
    let isDark = false;
    if (t === 'dark') {
      isDark = true;
    } else if (t === 'light') {
      isDark = false;
    } else {
      // system
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      setEffectiveTheme('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-mode');
      setEffectiveTheme('light');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('civicpulse_theme', theme);
  }, [theme]);

  // Listen to system preference changes if theme === 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      setTheme: () => {},
      effectiveTheme: 'light',
    };
  }
  return context;
}
