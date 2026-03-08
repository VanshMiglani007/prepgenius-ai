import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('prepgenius-theme') || 'cyan');

  const themes = [
    { id: 'cyan', name: 'Neon Blue', primary: '0 212 255', hover: '0 184 212', bg: '26 26 46' },
    { id: 'purple', name: 'Deep Purple', primary: '176 38 255', hover: '144 20 224', bg: '19 10 33' },
    { id: 'emerald', name: 'Cyberpunk Emerald', primary: '16 185 129', hover: '5 150 105', bg: '6 31 21' },
    { id: 'amber', name: 'Sunset Amber', primary: '245 158 11', hover: '217 119 6', bg: '40 20 10' },
    { id: 'rose', name: 'Rose Pink', primary: '244 63 94', hover: '225 29 72', bg: '39 12 20' }
  ];

  useEffect(() => {
    localStorage.setItem('prepgenius-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Explicitly set the CSS properties so Tailwind JIT responds immediately without page refresh
    const activeTheme = themes.find(t => t.id === theme) || themes[0];
    document.documentElement.style.setProperty('--color-primary', activeTheme.primary);
    document.documentElement.style.setProperty('--color-primary-hover', activeTheme.hover);
    document.documentElement.style.setProperty('--color-bg', activeTheme.bg);

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
