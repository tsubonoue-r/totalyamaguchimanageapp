'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Ruler,
  Factory,
  HardHat,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: '営業管理', href: '/sales', icon: Users },
  { name: '顧客管理', href: '/sales/customers', icon: Building2 },
  { name: '見積管理', href: '/sales/estimates', icon: FileText },
  { name: '設計管理', href: '/design', icon: Ruler },
  { name: '製造管理', href: '/manufacturing', icon: Factory },
  { name: '施工管理', href: '/construction', icon: HardHat },
]

const bottomNavigation = [
  { name: '設定', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-64 bg-yamaguchi-blue text-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yamaguchi-gold rounded-lg flex items-center justify-center">
            <span className="text-yamaguchi-blue font-bold text-xl">Y</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">山口産業</h1>
            <p className="text-xs text-white/60">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-white/10">
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          ログアウト
        </button>
      </div>
    </div>
  )
}
