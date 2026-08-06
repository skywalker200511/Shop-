import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FileWarning, PlusCircle, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      {/* Customer Top Nav */}
      <header className="sticky top-0 w-full z-30 flex justify-between items-center px-4 md:px-8 h-16 bg-white/80 backdrop-blur-md border-b border-[#e0e0da]">
        <div className="flex items-center gap-6">
          <img src="/logo.png" alt="Shop+" className="h-10 object-contain" />

          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/customer/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all',
                  isActive
                    ? 'bg-[#fff0f3] text-[#e11d48] border border-[#fecdd3] font-medium'
                    : 'text-[#555550] hover:bg-[#f5f5f0] hover:text-[#0a0a0a] border border-transparent',
                )
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              My Complaints
            </NavLink>
            <NavLink
              to="/customer/submit"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all',
                  isActive
                    ? 'bg-[#fff0f3] text-[#e11d48] border border-[#fecdd3] font-medium'
                    : 'text-[#555550] hover:bg-[#f5f5f0] hover:text-[#0a0a0a] border border-transparent',
                )
              }
            >
              <PlusCircle className="w-4 h-4" />
              Submit Complaint
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#f5f5f0] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#c81040] border border-red-200 flex items-center justify-center">
                <span className="text-xs font-bold text-white font-['JetBrains_Mono']">
                  {initials}
                </span>
              </div>
              <span className="hidden md:block text-sm text-[#0a0a0a] font-medium">{user?.full_name}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-[#e0e0da] rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[#e0e0da] bg-[#fafaf7]">
                  <p className="text-sm font-semibold text-[#0a0a0a]">{user?.full_name}</p>
                  <p className="text-xs text-[#737370] mt-0.5">{user?.email}</p>
                  {user?.company && <p className="text-xs text-[#a0a09a] mt-0.5">{user?.company}</p>}
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e11d48] hover:bg-[#fff0f3] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white/90 backdrop-blur-md border-t border-[#e0e0da] md:hidden shadow-lg">
        <NavLink
          to="/customer/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-all',
              isActive ? 'text-[#e11d48] bg-[#fff0f3] scale-110' : 'text-[#737370] hover:text-[#0a0a0a]',
            )
          }
        >
          <FileWarning className="w-5 h-5" />
          <span className="text-[10px] font-['JetBrains_Mono'] tracking-[0.05em]">Complaints</span>
        </NavLink>
        <NavLink
          to="/customer/submit"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-all',
              isActive ? 'text-[#e11d48] bg-[#fff0f3] scale-110' : 'text-[#737370] hover:text-[#0a0a0a]',
            )
          }
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-['JetBrains_Mono'] tracking-[0.05em]">Submit</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-4 py-1 text-[#737370] hover:text-[#0a0a0a] transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-['JetBrains_Mono'] tracking-[0.05em]">Profile</span>
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
