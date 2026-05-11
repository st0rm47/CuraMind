// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/utils/constants'

interface NavItem {
  to: string
  icon: string
  label: string
  badge?: number
}

const PATIENT_NAV: NavItem[] = [
  { to: '/patient/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/patient/healthinput', icon: '📋', label: 'Health Input' },
  { to: '/patient/predictions', icon: '🧠', label: 'AI Predictions' },
  { to: '/patient/risk', icon: '🔍', label: 'Risk Factors' },
  { to: '/patient/progress', icon: '📈', label: 'Progress' },
  { to: '/patient/followup', icon: '🔄', label: 'Follow-Up' },
  { to: '/patient/notes', icon: '💬', label: 'Doctor Notes' },
]

const DOCTOR_NAV: NavItem[] = [
  { to: '/doctor/dashboard', icon: '⬡', label: 'Overview' },
  { to: '/doctor/queue', icon: '👥', label: 'Queue' },
  { to: '/doctor/review', icon: '🩺', label: 'Review' },
  { to: '/doctor/followups', icon: '🔄', label: 'Follow-Ups' },
  { to: '/doctor/corrections', icon: '✏️', label: 'Corrections' },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', icon: '⬡', label: 'Dashboard' },
  // Add more admin-specific nav items here
]

// Bottom nav shows only the most important 4-5 items on mobile
const PATIENT_BOTTOM_NAV: NavItem[] = [
  { to: '/patient/dashboard', icon: '⬡', label: 'Home' },
  { to: '/patient/healthinput', icon: '📋', label: 'Input' },
  { to: '/patient/predictions', icon: '🧠', label: 'AI' },
  { to: '/patient/risk', icon: '🔍', label: 'Risk' },
  { to: '/patient/progress', icon: '📈', label: 'Progress' },
  { to: '/patient/followup', icon: '🔄', label: 'Follow-Up' },
  { to: '/patient/notes', icon: '💬', label: 'Notes' },
]

const DOCTOR_BOTTOM_NAV: NavItem[] = [
  { to: '/doctor/dashboard', icon: '⬡', label: 'Home' },
  { to: '/doctor/queue', icon: '👥', label: 'Queue' },
  { to: '/doctor/review', icon: '🩺', label: 'Review' },
  { to: '/doctor/followups', icon: '🔄', label: 'Follow-Ups' },
  { to: '/doctor/corrections', icon: '✏️', label: 'Fixes' },
]

const ADMIN_BOTTOM_NAV: NavItem[] = [
  { to: '/admin/dashboard', icon: '⬡', label: 'Home' },
  // Add more admin-specific bottom nav items here
]

interface SidebarProps {
  pendingCount?: number
}

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'doctor' ? DOCTOR_NAV : user?.role === 'admin' ? ADMIN_NAV : PATIENT_NAV
  const sectionLabel = user?.role === 'doctor' ? 'Doctor Panel' : user?.role === 'admin' ? 'Admin Panel' : 'Patient Panel'
  const bottomNavItems =
    user?.role === 'doctor' ? DOCTOR_BOTTOM_NAV
    : user?.role === 'admin' ? ADMIN_BOTTOM_NAV
    : PATIENT_BOTTOM_NAV
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 h-screen sticky top-0 flex-col bg-gray-900 border-r border-gray-800 shrink-0">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-5 border-b border-gray-800 w-full text-left hover:bg-gray-800/40 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
            style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
          >
            🧬
          </div>
          <div>
            <p className="font-extrabold text-[14px] leading-tight">{APP_NAME}</p>
            <p className="text-[10px] text-gray-500 font-mono capitalize">{user?.role}</p>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-5 overflow-y-auto">
          <p className="section-label">{sectionLabel}</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-0.5',
                  'text-[13px] font-medium transition-all duration-150 relative',
                  isActive
                    ? 'bg-brand-500/12 text-brand-400 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-[22%] bottom-[22%] w-[3px] bg-brand-500 rounded-r" />
                  )}
                  <span className="text-base w-[18px] text-center">{item.icon}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2.5 bg-gray-800 rounded-xl px-2.5 py-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#4da3ff,#00d4a8)' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate">{user?.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-500 font-mono capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-gray-500 hover:text-red-400 transition-colors text-base leading-none"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation bar (hidden on md+)  */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex items-stretch safe-area-inset-bottom">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-w-0',
                'text-[10px] font-medium transition-all duration-150 relative',
                isActive
                  ? 'text-brand-400'
                  : 'text-gray-500 hover:text-gray-300',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-brand-500 rounded-b" />
                )}
                <span className="text-[18px] leading-none">{item.icon}</span>
                <span className="truncate w-full text-center px-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </>
  )
}