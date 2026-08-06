import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

export function StaffLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]',
        )}
      >
        <TopNav />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
