import type { ReactNode } from 'react';

export interface NavBadge {
  text: string;
  tone?: 'alert' | 'count' | 'default';
}

export interface SidebarNavigationItem {
  type?: 'section' | 'item';
  label: string;
  path?: string;
  to?: string;
  icon?: ReactNode;
  badge?: NavBadge | string | number;
  module?: string;
  children?: SidebarNavigationItem[];
}

export interface SidebarProps {
  items?: SidebarNavigationItem[];
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  open?: boolean;
  onToggle?: () => void;
  collapsed?: boolean;
  canAccess?: (module?: string) => boolean;

  logo?: string;
  logoNode?: ReactNode;
  title?: string;
  subtitle?: string;
  version?: string;

  preview?: boolean;
}

