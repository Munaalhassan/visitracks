import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  UserPlus, 
  Search,
  Building2,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useBuilding } from '@/contexts/BuildingContext';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sign In Visitor', href: '/sign-in', icon: UserPlus },
  { name: 'Today\'s Log', href: '/today', icon: CalendarDays },
  { name: 'All Visitors', href: '/all-visitors', icon: Users },
  { name: 'Search Visitors', href: '/search', icon: Search },
  { name: 'Sessions', href: '/sessions', icon: CalendarDays },
  { name: 'Hosts', href: '/hosts', icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentBuilding, logout } = useBuilding();

  const handleLogout = () => {
    logout();
    window.location.href = '/select-building';
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">VisiTrack</span>
        </div>

        {/* Current Building Badge */}
        {currentBuilding && (
          <div className="px-4 py-3 border-b">
            <div className="text-xs text-muted-foreground mb-1">Current Building</div>
            <Badge variant="outline" className="w-full justify-center py-1">
              <Building2 className="h-3 w-3 mr-1" />
              {currentBuilding.name}
            </Badge>
          </div>
        )}
        
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Switch Building
          </Button>
        </div>
      </aside>
    </>
  );
}
