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
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Call Logs', href: '/calls', icon: Phone },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const handleNavClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white/70 backdrop-blur-xl border-r border-gray-200/60">
      {/* Logo */}
      <div className="flex h-16 sm:h-[72px] items-center justify-between gap-3 px-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
            <Headphones className="h-4 w-4 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">Viktoria</h1>
            <p className="text-xs text-slate-500">Control Center</p>
          </div>
        </div>
        {/* Close button - only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className={cn(
                'h-[18px] w-[18px]',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* AI Badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5 border border-slate-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">AI Powered</p>
            <p className="text-[11px] text-slate-400">ElevenLabs Voice</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">Dormero Hotels</p>
            <p className="text-xs text-slate-400">Support Team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
