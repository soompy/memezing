import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabGroupProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'tabs' | 'pills';
  children?: ReactNode;
}

export default function TabGroup({
  items,
  activeKey,
  onChange,
  className,
  variant = 'tabs',
}: TabGroupProps) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1',
              activeKey === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-700 hover:bg-gray-200'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex space-x-1 bg-gray-100 rounded-lg p-1', className)}>
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
            activeKey === key
              ? 'bg-white shadow-sm text-primary'
              : 'text-600 hover:text-900'
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}