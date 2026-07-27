import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    if (theme === 'light') return <Sun size={18} color="#f59e0b" />;
    if (theme === 'dark') return <Moon size={18} color="#6366f1" />;
    return <Laptop size={18} color="var(--color-text-secondary)" />;
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${getLabel()} (Click to change)`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '99px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        transition: 'all 0.3s ease',
      }}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </button>
  );
}
