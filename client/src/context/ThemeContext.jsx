import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('prepgenius-theme') || 'ocean');

  const themes = [
    { id: 'ocean',    name: 'Ocean Blue',       primary: '56 163 220',  hover: '45 140 195',  bg: '14 16 22',   accent: '#38a3dc' },
    { id: 'forest',   name: 'Forest Green',     primary: '74 172 120',  hover: '60 148 100',  bg: '12 18 14',   accent: '#4aac78' },
    { id: 'midnight', name: 'Midnight Indigo',   primary: '110 120 190', hover: '90 100 170',  bg: '12 12 20',   accent: '#6e78be' },
    { id: 'sand',     name: 'Warm Sand',        primary: '200 160 100', hover: '180 140 80',  bg: '20 17 13',   accent: '#c8a064' },
    { id: 'slate',    name: 'Slate Gray',       primary: '140 150 165', hover: '120 130 145', bg: '16 17 20',   accent: '#8c96a5' },
  ];

  useEffect(() => {
    localStorage.setItem('prepgenius-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const activeTheme = themes.find(t => t.id === theme) || themes[0];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', activeTheme.primary);
    root.style.setProperty('--color-primary-hover', activeTheme.hover);
    root.style.setProperty('--color-bg', activeTheme.bg);

    // Smooth transition on theme change
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    document.body.style.transition = 'background-color 0.3s ease';
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const activeTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
