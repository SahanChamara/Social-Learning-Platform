import { type FormEvent, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
  debounceMs?: number;
  navigateToOnSubmit?: string | null;
  className?: string;
  disabled?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onDebouncedChange,
  placeholder = 'Search by title, keyword, or topic',
  submitLabel = 'Search',
  debounceMs = 300,
  navigateToOnSubmit = '/courses',
  className,
  disabled = false,
}: SearchBarProps) {
  const navigate = useNavigate();
  const isMounted = useRef(false);

  useEffect(() => {
    if (!onDebouncedChange) {
      return;
    }

    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, onDebouncedChange, value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = value.trim();

    onSearch?.(normalized);

    if (navigateToOnSubmit) {
      const nextPath = normalized
        ? `${navigateToOnSubmit}?q=${encodeURIComponent(normalized)}`
        : navigateToOnSubmit;
      navigate(nextPath);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 border-slate-300 pl-10 pr-3 text-slate-900 focus-visible:ring-blue-100"
          disabled={disabled}
        />
      </div>
      <Button type="submit" className="h-11" disabled={disabled}>
        {submitLabel}
      </Button>
    </form>
  );
}
