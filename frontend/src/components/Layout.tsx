import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Github, Twitter, Linkedin, ShoppingCart, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import NotificationsDropdown from './NotificationsDropdown';
import ProfileMenu from './ProfileMenu';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { unreadThreadCount } = useSocket();
  const headerHeight = scrolled ? 64 : 72;
  const mainPaddingTop = headerHeight + 16;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/co-subs', label: 'Co-Subscriptions' },
    { path: '/how-it-works', label: 'How it Works' },
    { path: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300 border-b",
          scrolled ? "bg-white border-gray-200 shadow-sm" : "bg-white border-transparent"
        )}
        style={{ height: headerHeight }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-gray-900">UniShare</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-gray-900 text-white shadow-sm" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('q');
                if (query) {
                  navigate(`/marketplace?q=${encodeURIComponent(query.toString())}`);
                }
              }}
              className="relative hidden lg:block"
            >
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-white/50 border border-gray-200/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all w-48 focus:w-64 focus:bg-white"
              />
            </form>
            
            {user ? (
              <>
                <Link to="/inbox" className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
                  <MessageSquare className="w-5 h-5" />
                  {unreadThreadCount > 0 ? (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadThreadCount > 9 ? '9+' : unreadThreadCount}
                    </span>
                  ) : null}
                </Link>
                <NotificationsDropdown />
                <Link to="/cart" className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Link>
                <ProfileMenu />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Add top padding to account for fixed header */}
      <main className="flex-1 w-full pb-10 flex flex-col" style={{ paddingTop: mainPaddingTop }}>
        <div className={cn("w-full mx-auto", location.pathname === '/' ? "max-w-full px-0" : "max-w-7xl px-4 sm:px-6")}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-lg tracking-tight text-gray-900">UniShare</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                A UIU-only student marketplace for textbooks, course packs, and subscription sharing on campus.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"><Github className="w-5 h-5" /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace</Link></li>
                <li><Link to="/co-subs" className="hover:text-gray-900 transition-colors">Co-Subscriptions</Link></li>
                <li><Link to="/how-it-works" className="hover:text-gray-900 transition-colors">How it Works</Link></li>
                <li><Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/about" className="hover:text-gray-900 transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-gray-900 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} UniShare Inc. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Made with care for students.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
