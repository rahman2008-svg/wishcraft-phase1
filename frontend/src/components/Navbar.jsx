import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Templates', href: '/#templates' },
  { label: 'Explore', href: '/#explore' },
  { label: 'Pricing', href: '/#pricing' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wish-gradient text-white">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          WishCraft
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-wish-ink-700 transition hover:text-wish-violet-600 dark:text-wish-ink-100/80 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-full glass-panel transition hover:scale-105"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className="btn-secondary !px-5 !py-2 text-sm">
                Hi, {user?.name?.split(' ')[0]}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="flex h-10 w-10 items-center justify-center rounded-full glass-panel transition hover:scale-105"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium text-wish-ink-700 hover:text-wish-violet-600 dark:text-wish-ink-100/80 dark:hover:text-white">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn-primary !px-5 !py-2 text-sm">
                Create a wish
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full glass-panel md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="glass-panel-strong mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-wish-violet-500/10"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px bg-wish-violet-500/10" />
            <button
              type="button"
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-wish-violet-500/10"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-wish-violet-500/10"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-wish-violet-500/10"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-wish-violet-500/10"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-1 w-full !py-2 text-sm"
                >
                  Create a wish
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
