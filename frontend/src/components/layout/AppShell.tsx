import { Menu, X, GraduationCap, LogOut, User, BookOpen, Compass, LayoutDashboard, Search, PenTool } from 'lucide-react';
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
    'inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition',
    isActive
      ? 'border border-cyan-300/25 bg-cyan-300/12 text-cyan-100 shadow-lg shadow-cyan-500/10'
      : 'text-slate-400 hover:bg-white/8 hover:text-slate-50',
  ].join(' ');
}

export default function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isCreator = user?.role === UserRole.CREATOR || user?.role === UserRole.ADMIN;
  const navLinks = isAuthenticated ? learnerLinks : publicLinks;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen text-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070B14]/72 backdrop-blur-2xl">
        <div className="app-container flex h-18 items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-slate-50" onClick={closeMenu}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 via-sky-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="hidden text-base tracking-tight sm:inline">LearnVerse</span>
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
              <NavLink to="/creator" className={navClass}>
                <PenTool className="h-4 w-4" />
                Creator
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
                <Button size="sm" variant="premium" asChild>
                  <Link to="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/7 text-slate-100 backdrop-blur-xl md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/8 bg-[#070B14]/95 backdrop-blur-2xl md:hidden">
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
                <NavLink to="/creator" className={navClass} onClick={closeMenu}>
                  <PenTool className="h-4 w-4" />
                  Creator
                </NavLink>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/8 pt-3">
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
                    <Button size="sm" variant="premium" asChild>
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
