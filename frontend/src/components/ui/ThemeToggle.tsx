import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/7 text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:text-cyan-100"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
