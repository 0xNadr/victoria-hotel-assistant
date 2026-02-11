'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Phone,
  BarChart3,
  Headphones,
  Sparkles,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview & test agent' },
  { name: 'Call Logs', href: '/calls', icon: Phone, description: 'Review conversations' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance metrics' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-dormero-dark to-[#141414]">
      {/* Logo */}
      <div className="flex h-16 sm:h-20 items-center justify-between gap-3 px-4 sm:px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700 shadow-lg shadow-dormero-red/20">
            <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-dormero-dark animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Viktoria</h1>
            <p className="text-xs text-gray-500 font-medium">Control Center</p>
          </div>
        </div>
        {/* Close button - only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 sm:py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-dormero-red text-white shadow-lg shadow-dormero-red/25'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-white/5 group-hover:bg-white/10'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span>{item.name}</span>
                {!isActive && (
                  <span className="text-xs text-gray-600 group-hover:text-gray-500">
                    {item.description}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* AI Badge */}
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-dormero-red/10 to-purple-500/10 px-3 sm:px-4 py-2.5 sm:py-3 border border-white/5">
          <Sparkles className="h-4 w-4 text-dormero-red" />
          <div>
            <p className="text-xs font-medium text-white">AI Powered</p>
            <p className="text-xs text-gray-500">ElevenLabs Voice</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 p-3 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 cursor-pointer transition-colors">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-2 ring-white/10">
            <span className="text-xs sm:text-sm font-semibold text-white">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Dormero Hotels</p>
            <p className="text-xs text-gray-500">Support Team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
