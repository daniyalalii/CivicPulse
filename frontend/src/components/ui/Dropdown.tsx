// ─────────────────────────────────────────────────────────────
// src/components/ui/Dropdown.tsx
// Accessible popover dropdown menu.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface DropdownItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 min-w-[180px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md shadow-md py-1 fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                setIsOpen(false);
                item.onClick?.();
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-scale-xs text-left transition-colors focus-ring select-none cursor-pointer ${
                item.danger
                  ? 'text-[var(--status-rejected-fg)] hover:bg-[var(--status-rejected-bg)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {item.icon && <span className="text-[var(--text-muted)] shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
