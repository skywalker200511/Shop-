import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileWarning,
  Brain,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const staffNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/complaints', icon: FileWarning, label: 'Complaints' },
  { to: '/ai-analysis', icon: Brain, label: 'AI Analysis' },
];

export function Sidebar() {
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-[#090909] border-r border-[#2a2a2a] z-50 flex flex-col transition-all duration-300 ease-in-out',
          // Desktop
          'hidden md:flex',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#171717] border border-[#2a2a2a] flex items-center justify-center hover:border-[#e11d48] hover:shadow-[0_0_10px_rgba(225,29,72,0.3)] transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-[280px] bg-[#090909] border-r border-[#2a2a2a] z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute right-3 top-4">
          <button
            onClick={closeMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#171717] transition-colors"
          >
            <X className="w-4 h-4 text-[#e5bdbe]" />
          </button>
        </div>
        <SidebarContent isCollapsed={false} onNavClick={closeMobile} />
      </aside>
    </>
  );
}

function SidebarContent({
  isCollapsed,
  onNavClick,
}: {
  isCollapsed: boolean;
  onNavClick?: () => void;
}) {
  const location = useLocation();

  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-[#2a2a2a] h-16 flex-shrink-0',
          isCollapsed ? 'justify-center px-2' : 'px-6',
        )}
      >
        <h1
          className={cn(
            'font-bold tracking-[-0.04em] text-white transition-all',
            isCollapsed ? 'text-sm' : 'text-xl',
          )}
        >
          {isCollapsed ? 'N' : 'NEXUS AI'}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {staffNavItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={cn(
                'relative flex items-center gap-3 rounded-[10px] transition-all duration-200 group',
                isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                isActive
                  ? 'bg-[#171717] text-white border border-[#2a2a2a]'
                  : 'text-[#e5bdbe] hover:bg-[#171717] hover:text-white border border-transparent',
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#e11d48] rounded-r-full shadow-[0_0_8px_rgba(225,29,72,0.6)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <item.icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-[#e11d48] drop-shadow-[0_0_5px_rgba(225,29,72,0.5)]'
                    : 'text-[#e5bdbe] group-hover:text-white',
                  isCollapsed ? 'w-5 h-5' : 'w-5 h-5',
                )}
              />

              {!isCollapsed && (
                <span className={cn('text-sm font-medium', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
