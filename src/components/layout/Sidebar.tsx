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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-[#e0e0da] z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm',
          'hidden md:flex',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-[#e0e0da] flex items-center justify-center hover:border-[#e11d48] hover:shadow-md transition-all shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-[#555550]" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-[#555550]" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-[#e0e0da] z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-xl',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute right-3 top-4">
          <button
            onClick={closeMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f5f5f0] transition-colors"
          >
            <X className="w-4 h-4 text-[#555550]" />
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
          'flex items-center border-b border-[#e0e0da] h-16 flex-shrink-0',
          isCollapsed ? 'justify-center px-2' : 'px-6',
        )}
      >
        <h1
          className={cn(
            'font-black tracking-[-0.04em] transition-all',
            isCollapsed ? 'text-sm text-[#e11d48]' : 'text-xl',
          )}
        >
          {isCollapsed ? 'N' : (
            <span>
              <span className="text-[#0a0a0a]">NEXUS</span>{' '}
              <span className="text-[#e11d48]">AI</span>
            </span>
          )}
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
                'relative flex items-center gap-3 rounded-xl transition-all duration-200 group',
                isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                isActive
                  ? 'bg-[#fff0f3] text-[#0a0a0a] border border-[#fecdd3]'
                  : 'text-[#555550] hover:bg-[#f5f5f0] hover:text-[#0a0a0a] border border-transparent',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#e11d48] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <item.icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-[#e11d48]' : 'text-[#737370] group-hover:text-[#0a0a0a]',
                  'w-5 h-5',
                )}
              />

              {!isCollapsed && (
                <span className={cn('text-sm font-medium', isActive && 'font-semibold text-[#e11d48]')}>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom label */}
      {!isCollapsed && (
        <div className="px-5 py-4 border-t border-[#e0e0da]">
          <p className="text-[10px] font-mono text-[#a0a09a] tracking-widest uppercase">v1.0 · Enterprise</p>
        </div>
      )}
    </>
  );
}
