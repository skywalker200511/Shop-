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
          'fixed left-4 top-4 h-[calc(100vh-2rem)] bg-[#090909] text-white rounded-[24px] border border-[#2a2a2a] z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl',
          'hidden md:flex',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
        )}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#171717] border border-[#2a2a2a] flex items-center justify-center hover:border-[#e11d48] hover:shadow-md transition-all shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-[#a0a09a]" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-[#a0a09a]" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-2 top-2 h-[calc(100vh-1rem)] w-[280px] bg-[#090909] text-white rounded-[24px] border border-[#2a2a2a] z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl',
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
          'flex items-center border-b border-[#2a2a2a] h-16 flex-shrink-0',
          isCollapsed ? 'justify-center px-3' : 'px-2',
        )}
      >
        {isCollapsed ? (
          <span className="text-2xl font-black text-white">S+</span>
        ) : (
          <img
            src="/logo.png"
            alt="Shop+ Logo"
            className="w-full h-full object-contain object-center py-1"
          />
        )}
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
                  ? 'bg-[#1f1f1f] text-white border border-[#2a2a2a]'
                  : 'text-[#a0a09a] hover:bg-[#121212] hover:text-white border border-transparent',
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
                  isActive ? 'text-[#e11d48]' : 'text-[#a0a09a] group-hover:text-white',
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
        <div className="px-5 py-4 border-t border-[#2a2a2a]">
          <p className="text-[10px] font-mono text-[#a0a09a] tracking-widest uppercase">v1.0 · Enterprise</p>
        </div>
      )}
    </>
  );
}
