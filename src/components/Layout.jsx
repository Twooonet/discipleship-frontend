import { NavLink, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/threads', label: 'Threads', icon: ThreadsIcon },
  { to: '/offerings', label: 'Offerings', icon: OfferingsIcon },
  { to: '/feedback', label: 'Feedback', icon: FeedbackIcon },
];

export default function Layout({ children }) {
  const { isAdmin, logout } = useAdmin();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-primary-800 text-white fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✝</span>
            <div>
              <p className="font-bold text-lg leading-tight">Discipleship</p>
              <p className="text-primary-300 text-xs">Group App</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-primary-700">
          {isAdmin ? (
            <div className="space-y-2">
              <p className="text-xs text-primary-300 px-3">Logged in as Admin</p>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm text-primary-200 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/admin-login"
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
            >
              <LockIcon className="w-4 h-4" />
              Admin Login
            </NavLink>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function ThreadsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  );
}
function OfferingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function FeedbackIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
