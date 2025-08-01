import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dorëzo një ide' },
    { path: '/aplikimet', label: 'Aplikimet' },
  ];

  return (
    <nav className="bg-[#142657] text-[#fffef9] sticky top-0 z-50 border-b border-[#142657]/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-[#fffef9] hover:text-[#d4af37] transition-colors">
              Gjenerata e Inovacionit
            </Link>
          </div>

          {/* User Info, Nav Items & Logout - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors relative",
                  isActive(item.path)
                    ? "text-[#d4af37] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#d4af37]"
                    : "text-[#fffef9] hover:text-[#d4af37]"
                )}
              >
                {item.label}
              </Link>
            ))}
            {/* <div className="flex flex-col items-end ml-4">
              <div className="text-sm font-medium text-[#fffef9]">
                {user?.user_metadata?.emri} {user?.user_metadata?.mbiemri}
              </div>
              <div className="text-xs text-[#fffef9]/80">Aplikant</div>
            </div> */}
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="text-[#fffef9] hover:text-[#d4af37] hover:bg-[#fffef9]/10 ml-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Dil
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="sm"
              className="text-[#fffef9] hover:text-[#d4af37] hover:bg-[#fffef9]/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-[#fffef9]/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-base font-medium transition-colors rounded-md",
                    isActive(item.path)
                      ? "text-[#d4af37] bg-[#fffef9]/10"
                      : "text-[#fffef9] hover:text-[#d4af37] hover:bg-[#fffef9]/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {/* Mobile User Info & Logout in a row */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-[#fffef9]/20 mt-3">
                {/* <div>
                  <div className="text-sm font-medium text-[#fffef9]">
                    {user?.user_metadata?.emri} {user?.user_metadata?.mbiemri}
                  </div>
                  <div className="text-xs text-[#fffef9]/80">Aplikant</div>
                </div> */}
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                  className="text-[#fffef9] hover:text-[#d4af37] hover:bg-[#fffef9]/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Dil
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}