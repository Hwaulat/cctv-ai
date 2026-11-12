import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import type { SidebarNavigationItem } from '@/types/layout';

interface SidebarItemProps {
  item: SidebarNavigationItem;
  collapsed?: boolean;
  isMobile?: boolean;
  canAccess?: (module?: string) => boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  collapsed = false,
  isMobile = false,
  canAccess = () => true,
}) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isOpen, setIsOpen] = useState(false);

  const href = item.to || item.path || '#';
  const hasChildren = item.children && item.children.length > 0;
  const filteredChildren = hasChildren
    ? item.children!.filter((child) => canAccess(child.module))
    : [];

  const isActive =
    pathname === href ||
    (hasChildren &&
      filteredChildren.some((child) => pathname === (child.to || child.path)));

  const badgeText =
    typeof item.badge === 'object' && item.badge !== null
      ? item.badge.text
      : item.badge !== undefined
        ? String(item.badge)
        : null;

  const isAlertBadge =
    typeof item.badge === 'object' && item.badge !== null
      ? item.badge.tone === 'alert'
      : false;

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
            isActive
              ? 'bg-[#183252] text-white font-medium'
              : 'text-[#8EA8C3] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {item.icon && (
              <span className="w-5 h-5 shrink-0 flex items-center justify-center [&_svg]:size-4">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badgeText && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                  isAlertBadge
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[#1E3A5F] text-[#4E8FD9]'
                }`}
              >
                {badgeText}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 text-[#4E8FD9] ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="pl-4 space-y-1">
            {filteredChildren.map((child, idx) => {
              const childHref = child.to || child.path || '#';
              const isChildActive = pathname === childHref;
              return (
                <Link
                  key={idx}
                  to={childHref}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isChildActive
                      ? 'bg-[#183252] text-white font-medium'
                      : 'text-[#8EA8C3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {child.icon && (
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center [&_svg]:size-3.5">
                      {child.icon}
                    </span>
                  )}
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={href}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center rounded-lg transition-colors group ${
        collapsed
          ? 'justify-center w-10 h-10 mx-auto'
          : 'gap-3 px-3 py-2 text-sm'
      } ${
        isActive
          ? 'bg-[#183252] text-white font-medium'
          : 'text-[#8EA8C3] hover:text-white hover:bg-white/5'
      }`}
    >
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span
          className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#4E8FD9] ${
            collapsed ? 'hidden' : 'block'
          }`}
        />
      )}

      {item.icon && (
        <span
          className={`shrink-0 flex items-center justify-center ${
            collapsed ? '[&_svg]:size-5' : '[&_svg]:size-4'
          } ${isActive ? 'text-[#4E8FD9]' : 'group-hover:text-white'}`}
        >
          {item.icon}
        </span>
      )}

      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

      {!collapsed && badgeText && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none shrink-0 ${
            isAlertBadge
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-[#1E3A5F] text-[#4E8FD9]'
          }`}
        >
          {badgeText}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;

