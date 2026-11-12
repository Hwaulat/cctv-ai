import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SidebarProps, SidebarNavigationItem } from '@/types/layout';
import SidebarItem from './sidebar-item';
import {
  Camera,
  History,
  LayoutGrid,
  Map,
} from 'lucide-react';
import { events, rooms } from '@/lib/data';

const Sidebar: React.FC<SidebarProps> = ({
  items: itemsProp,
  sidebarOpen: sidebarOpenProp,
  setSidebarOpen,
  open,
  onToggle,
  collapsed: collapsedProp,
  canAccess = () => true,

  logo = '/rdl-icon.svg',
  title = 'AI CCTV Monitoring',
  subtitle = 'Security Platform',
  version = 'v2.4.1',

  preview = false,
}) => {
  const alertCount = rooms.filter((r) => r.smoke === 'alert').length;

  const defaultItems: SidebarNavigationItem[] = useMemo(
    () => [
      { type: 'section', label: 'Core Functions' },
      {
        label: 'Monitoring',
        to: '/',
        icon: <LayoutGrid className="w-4 h-4" />,
        badge:
          alertCount > 0
            ? { text: `${alertCount} ALERT`, tone: 'alert' }
            : undefined,
      },
      {
        label: 'Floor Plan Heatmap',
        to: '/floor-plan',
        icon: <Map className="w-4 h-4" />,
      },
      {
        label: 'Event Log',
        to: '/events',
        icon: <History className="w-4 h-4" />,
        badge: { text: String(events.length), tone: 'count' },
      },
      { type: 'section', label: 'Setup System' },
      {
        label: 'Cameras & Rooms',
        to: '/cameras',
        icon: <Camera className="w-4 h-4" />,
      },
    ],
    [alertCount],
  );

  const items = itemsProp ?? defaultItems;

  const isSidebarOpen =
    sidebarOpenProp !== undefined
      ? sidebarOpenProp
      : open !== undefined
        ? open
        : true;

  const isCollapsed =
    collapsedProp !== undefined ? collapsedProp : !isSidebarOpen;

  const handleClose = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    } else if (onToggle && isSidebarOpen) {
      onToggle();
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.type === 'section') return true;

      if (item.children) {
        return item.children.some((child) => canAccess(child.module));
      }

      return canAccess(item.module);
    });
  }, [items, canAccess]);

  return (
    <>
      {/* Mobile */}
      {!preview && (
        <aside
          className={`fixed top-0 left-0 lg:hidden z-40 h-dvh w-64 bg-[#0D1B2E] flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt={title} className="w-10 h-10 object-contain" />

              <div>
                <p className="text-white text-sm font-bold leading-tight">{title}</p>
                <p className="text-[#4E8FD9] text-xs font-medium leading-tight">{subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-lg hover:bg-white/5 text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Menu */}
          <ScrollArea className="flex-1">
            <nav className="px-3 py-4 space-y-1">
              {filteredItems.map((item, i) =>
                item.type === 'section' ? (
                  <div
                    key={i}
                    className="text-[#3D5A7A] text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-2"
                  >
                    {item.label}
                  </div>
                ) : (
                  <SidebarItem
                    key={i}
                    item={item}
                    collapsed={false}
                    isMobile
                    canAccess={canAccess}
                  />
                ),
              )}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 text-xs text-[#3D5A7A] flex items-center justify-between">
            <span>System Online</span>
            <span className="font-mono text-[10px]">{version}</span>
          </div>
        </aside>
      )}

      {/* Desktop */}
      <aside
        className={`${
          preview ? 'absolute' : 'hidden lg:flex fixed'
        } left-0 top-0 z-30 h-full lg:h-dvh bg-[#0D1B2E] flex-col transition-all duration-300 ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center px-3 shrink-0">
          {isCollapsed ? (
            <img src={logo} alt={title} className="w-10 h-10 mx-auto object-contain" />
          ) : (
            <div className="flex items-center gap-3 px-2">
              <img src={logo} alt={title} className="w-10 h-10 object-contain" />

              <div>
                <p className="text-white text-sm font-bold leading-tight">{title}</p>
                <p className="text-[#4E8FD9] text-xs font-medium leading-tight">{subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4 space-y-1">
            {filteredItems.map((item, i) =>
              item.type === 'section' ? (
                !isCollapsed && (
                  <div
                    key={i}
                    className="text-[#3D5A7A] text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-2"
                  >
                    {item.label}
                  </div>
                )
              ) : (
                <SidebarItem
                  key={i}
                  item={item}
                  collapsed={isCollapsed}
                  isMobile={false}
                  canAccess={canAccess}
                />
              ),
            )}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-[#3D5A7A] flex items-center justify-between">
          {isCollapsed ? (
            <span className="mx-auto text-success text-base leading-none">●</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success inline-block" />
                System Online
              </span>
              <span className="font-mono text-[10px]">{version}</span>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export const AppSidebar = Sidebar;
export default Sidebar;
