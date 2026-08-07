import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

export function StaffLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 w-full',
          isCollapsed ? 'md:ml-[104px] md:w-[calc(100%-104px)]' : 'md:ml-[292px] md:w-[calc(100%-292px)]',
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
