// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/utils/constants'

interface NavItem {
  to:     string
  icon:   string
  label:  string
  badge?: number
}

const PATIENT_NAV: NavItem[] = [
  { to: '/patient/dashboard',   icon: '⬡',  label: 'Dashboard' },
  { to: '/patient/healthinput',       icon: '📋', label: 'Health Input' },
  { to: '/patient/predictions', icon: '🧠', label: 'AI Predictions' },
  { to: '/patient/risk',        icon: '🔍', label: 'Risk Factors' },
  { to: '/patient/progress',    icon: '📈', label: 'Progress' },
  { to: '/patient/followup',    icon: '🔄', label: 'Follow-Up' },
  { to: '/patient/notes',       icon: '💬', label: 'Doctor Notes' },
]

const DOCTOR_NAV: NavItem[] = [
  { to: '/doctor/dashboard',  icon: '⬡',  label: 'Overview'      },
  { to: '/doctor/queue',      icon: '👥', label: 'Patient Queue'  },
  { to: '/doctor/review',     icon: '🩺', label: 'Review Case'   },
  { to: '/doctor/corrections',  icon: '✏️', label: 'Corrections'     },
]

interface SidebarProps {
  pendingCount?: number
}

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV
  const sectionLabel = user?.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 h-screen sticky top-0 flex flex-col bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
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
      </div>

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
                {/* {item.label === 'Patient Queue' && pendingCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold font-mono rounded-full px-1.5 py-0.5">
                    {pendingCount}
                  </span>
                )} */}
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
  )
}
