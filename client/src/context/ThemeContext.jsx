import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('prepgenius-theme') || 'cyan');

  const themes = [
    { id: 'cyan', name: 'Neon Blue' },
    { id: 'purple', name: 'Deep Purple' },
    { id: 'emerald', name: 'Cyberpunk Emerald' },
    { id: 'amber', name: 'Sunset Amber' }
  ];

  useEffect(() => {
    localStorage.setItem('prepgenius-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
