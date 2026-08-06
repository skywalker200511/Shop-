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
    <header className="sticky top-0 w-full z-30 flex justify-between items-center px-4 md:px-6 h-16 bg-[#090909]/90 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-[10px] hover:bg-[#171717] transition-colors text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile logo */}
        <h1 className="font-bold text-lg tracking-[-0.04em] text-white md:hidden">
          NEXUS AI
        </h1>

        {/* Desktop search */}
        <div className="hidden md:flex items-center bg-[#171717] rounded-[10px] px-4 py-2 w-80 lg:w-96 border border-[#2a2a2a] focus-within:border-[#e11d48] transition-colors">
          <Search className="w-4 h-4 text-[#e5bdbe] mr-2 flex-shrink-0" />
          <input
            className="bg-transparent border-none focus:outline-none text-sm text-white w-full placeholder:text-[#707070] font-['Inter']"
            placeholder="Search across organization..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Ask AI button - desktop */}
        <button
          onClick={() => navigate('/ai-analysis')}
          className="hidden md:flex items-center gap-2 bg-[#090909] border border-[#e11d48] text-white px-4 py-2 rounded-[10px] hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-['JetBrains_Mono'] text-xs tracking-[0.05em]">Ask AI</span>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 flex items-center justify-center rounded-[10px] hover:bg-[#171717] transition-colors relative text-[#e5bdbe] hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#e11d48] rounded-full shadow-[0_0_5px_rgba(225,29,72,0.8)] animate-pulse" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-[10px] bg-[#171717] overflow-hidden border border-[#2a2a2a] hover:border-[#e11d48] transition-colors flex items-center justify-center ml-1"
          >
            <span className="text-xs font-semibold text-white font-['JetBrains_Mono']">
              {initials}
            </span>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-56 bg-[#171717] border border-[#2a2a2a] rounded-[10px] shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#2a2a2a]">
                <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                <p className="text-xs text-[#e5bdbe] mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#2a2a2a] rounded text-[10px] font-['JetBrains_Mono'] text-[#e5bdbe] uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e5bdbe] hover:bg-[#2a2a2a] hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e11d48] hover:bg-[#2a2a2a] transition-colors"
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
