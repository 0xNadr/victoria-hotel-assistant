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
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview & test agent' },
  { name: 'Call Logs', href: '/calls', icon: Phone, description: 'Review conversations' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Performance metrics' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-dormero-dark to-[#141414]">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-white/5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700 shadow-lg shadow-dormero-red/20">
          <Headphones className="h-5 w-5 text-white" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-dormero-dark animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Viktoria</h1>
          <p className="text-xs text-gray-500 font-medium">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
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
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-dormero-red/10 to-purple-500/10 px-4 py-3 border border-white/5">
          <Sparkles className="h-4 w-4 text-dormero-red" />
          <div>
            <p className="text-xs font-medium text-white">AI Powered</p>
            <p className="text-xs text-gray-500">ElevenLabs Voice</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5 cursor-pointer transition-colors">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-2 ring-white/10">
            <span className="text-sm font-semibold text-white">D</span>
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
