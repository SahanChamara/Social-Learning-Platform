import { Menu, X, GraduationCap, LogOut, User, BookOpen, Compass, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types/auth';

const publicLinks = [
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
];

const learnerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-learning', label: 'My Learning', icon: GraduationCap },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/discover', label: 'Discover', icon: Compass },
];

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  ].join(' ');
}

export default function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCreator = user?.role === UserRole.CREATOR || user?.role === UserRole.ADMIN;
  const navLinks = isAuthenticated ? learnerLinks : publicLinks;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="app-container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-slate-950" onClick={closeMenu}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Social Learning</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
            {isCreator ? (
              <NavLink to="/courses/create" className={navClass}>
                <BookOpen className="h-4 w-4" />
                Create Course
              </NavLink>
            ) : null}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {isAuthenticated ? <NotificationBell /> : null}
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={navClass}>
                  <User className="h-4 w-4" />
                  Profile
                </NavLink>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <nav className="app-container space-y-1 py-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink key={link.to} to={link.to} className={navClass} onClick={closeMenu}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}
              {isCreator ? (
                <NavLink to="/courses/create" className={navClass} onClick={closeMenu}>
                  <BookOpen className="h-4 w-4" />
                  Create Course
                </NavLink>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <ThemeToggle />
                {isAuthenticated ? <NotificationBell /> : null}
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile" onClick={closeMenu}>Profile</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/auth/login" onClick={closeMenu}>Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/auth/register" onClick={closeMenu}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
