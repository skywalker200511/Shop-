import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Bell, Menu, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

export function TopNav() {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    <header className="sticky top-0 w-full z-30 flex justify-between items-center px-4 md:px-6 h-16 bg-white/80 backdrop-blur-md border-b border-[#e0e0da]">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f5f5f0] transition-colors text-[#555550]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <div className="md:hidden">
          <img src="/logo.png" alt="Shop+" className="h-8 object-contain" />
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex items-center bg-[#f5f5f0] rounded-xl px-4 py-2 w-80 lg:w-96 border border-[#e0e0da] focus-within:border-[#e11d48] focus-within:bg-white focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-[#a0a09a] mr-2 flex-shrink-0" />
          <input
            className="bg-transparent border-none focus:outline-none text-sm text-[#0a0a0a] w-full placeholder:text-[#a0a09a] font-['Inter']"
            placeholder="Search across organization..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Ask AI button */}
        <button
          onClick={() => navigate('/ai-analysis')}
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#e11d48] to-[#c81040] text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-red-100 transition-all text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold">Ask AI</span>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f5f5f0] transition-colors relative text-[#737370] hover:text-[#0a0a0a]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#e11d48] rounded-full animate-pulse" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e11d48] to-[#c81040] overflow-hidden border border-red-200 hover:shadow-md transition-all flex items-center justify-center ml-1"
          >
            <span className="text-xs font-bold text-white font-['JetBrains_Mono']">
              {initials}
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-[#e0e0da] rounded-2xl shadow-xl shadow-black/5 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#e0e0da] bg-[#fafaf7]">
                <p className="text-sm font-semibold text-[#0a0a0a]">{user?.full_name}</p>
                <p className="text-xs text-[#737370] mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#fff0f3] text-[#e11d48] border border-red-100 rounded text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#555550] hover:bg-[#f5f5f0] hover:text-[#0a0a0a] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
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
  );
}
