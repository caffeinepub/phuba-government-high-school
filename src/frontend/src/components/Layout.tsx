import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { SiFacebook, SiX, SiInstagram } from 'react-icons/si';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/students', label: 'Students' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/schedules', label: 'Schedules' },
    { to: '/events', label: 'Events' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and School Name */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  Phuba Government High School
                </h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold text-foreground">PGHS</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === link.to
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="hidden sm:flex"
              >
                {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPath === link.to
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    handleAuth();
                    setMobileMenuOpen(false);
                  }}
                  disabled={disabled}
                  variant={isAuthenticated ? 'outline' : 'default'}
                  size="sm"
                  className="mt-2"
                >
                  {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* School Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground">PGHS</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Phuba Government High School - Excellence in Education
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/students" className="hover:text-foreground transition-colors">
                    Student Directory
                  </Link>
                </li>
                <li>
                  <Link to="/announcements" className="hover:text-foreground transition-colors">
                    Announcements
                  </Link>
                </li>
                <li>
                  <Link to="/schedules" className="hover:text-foreground transition-colors">
                    Class Schedules
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-foreground transition-colors">
                    Events Calendar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Connect With Us</h3>
              <div className="flex gap-3 mb-4">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook className="w-4 h-4 text-accent-foreground" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <SiX className="w-4 h-4 text-accent-foreground" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram className="w-4 h-4 text-accent-foreground" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Phuba Government High School. All rights reserved.
            </p>
            <p className="mt-2">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'pghs-app'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
