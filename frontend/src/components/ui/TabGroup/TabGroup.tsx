import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './TabGroup.module.scss';

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
      <div className={cn(styles.pillsGroup, className)}>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              styles.pill,
              activeKey === key ? styles.active : styles.inactive
            )}
          >
            {Icon && <Icon className={styles.icon} />}
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(styles.tabGroup, className)}>
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            styles.tab,
            activeKey === key ? styles.active : styles.inactive
          )}
        >
          {Icon && <Icon className={styles.icon} />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}