'use client'

import { useMemo } from 'react'
import Header from '@/components/Header'
import {
  TrendingUp,
  FileText,
  Factory,
  HardHat,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { cn, formatCurrency, getStatusLabel } from '@/lib/utils'
import { useProjects, useProjectStats } from '@/hooks'
import type { Project, ProjectStatus } from '@/types'

// ステータスラベル定義
const statusLabels: Record<string, { label: string; color: string }> = {
  inquiry: { label: '問い合わせ', color: 'bg-gray-100 text-gray-800' },
  estimating: { label: '見積中', color: 'bg-yellow-100 text-yellow-800' },
  negotiating: { label: '商談中', color: 'bg-blue-100 text-blue-800' },
  contracted: { label: '契約済', color: 'bg-green-100 text-green-800' },
  designing: { label: '設計中', color: 'bg-purple-100 text-purple-800' },
  manufacturing: { label: '製造中', color: 'bg-orange-100 text-orange-800' },
  installing: { label: '施工中', color: 'bg-cyan-100 text-cyan-800' },
  completed: { label: '完了', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' },
}

// デモデータ（Firestoreにデータがない場合のフォールバック）
const demoProjects: Partial<Project>[] = [
  {
    id: '1',
    projectNumber: 'YS-2024-042',
    name: '○○スタジアム膜屋根',
    customerId: 'demo-1',
    status: 'designing' as ProjectStatus,
    estimatedAmount: 45000000,
  },
  {
    id: '2',
    projectNumber: 'YS-2024-041',
    name: '△△商業施設エントランス',
    customerId: 'demo-2',
    status: 'manufacturing' as ProjectStatus,
    estimatedAmount: 28000000,
  },
  {
    id: '3',
    projectNumber: 'YS-2024-040',
    name: '□□公園パーゴラ',
    customerId: 'demo-3',
    status: 'installing' as ProjectStatus,
    estimatedAmount: 12000000,
  },
  {
    id: '4',
    projectNumber: 'YS-2024-039',
    name: '○△倉庫テント',
    customerId: 'demo-4',
    status: 'estimating' as ProjectStatus,
    estimatedAmount: 8500000,
  },
]

const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'YS-2024-038: 材料入荷が2日遅延しています',
    time: '30分前',
  },
  {
    id: 2,
    type: 'info',
    message: 'YS-2024-042: 設計図面が承認されました',
    time: '1時間前',
  },
  {
    id: 3,
    type: 'success',
    message: 'YS-2024-035: 施工が完了しました',
    time: '2時間前',
  },
]

export default function DashboardPage() {
  const { projects, loading: projectsLoading } = useProjects({ limitCount: 10 })
  const { stats, loading: statsLoading } = useProjectStats()

  // 表示用プロジェクト（実データがなければデモデータ）
  const displayProjects = useMemo(() => {
    if (projects.length > 0) return projects
    return demoProjects as Project[]
  }, [projects])

  // 統計データを計算
  const statsData = useMemo(() => {
    const byStatus = stats?.byStatus || {}
    const byPhase = stats?.byPhase || {}

    // 進行中案件（完了・キャンセル以外）
    const activeCount = Object.entries(byStatus)
      .filter(([status]) => status !== 'completed' && status !== 'cancelled')
      .reduce((sum, [, count]) => sum + count, 0)

    return [
      {
        name: '進行中案件',
        value: stats ? String(activeCount) : '24',
        icon: TrendingUp,
        color: 'bg-blue-500',
      },
      {
        name: '見積中',
        value: stats ? String(byStatus['estimating'] || 0) : '8',
        icon: FileText,
        color: 'bg-yellow-500',
      },
      {
        name: '製造中',
        value: stats ? String(byStatus['manufacturing'] || 0) : '6',
        icon: Factory,
        color: 'bg-orange-500',
      },
      {
        name: '施工中',
        value: stats ? String(byStatus['installing'] || 0) : '4',
        icon: HardHat,
        color: 'bg-cyan-500',
      },
    ]
  }, [stats])

  // フェーズ別データ
  const phaseData = useMemo(() => {
    const byPhase = stats?.byPhase || {}
    return [
      { phase: '営業', count: byPhase['sales'] || 0, color: 'bg-blue-500', progress: 75 },
      { phase: '設計', count: byPhase['design'] || 0, color: 'bg-purple-500', progress: 60 },
      { phase: '製造', count: byPhase['manufacturing'] || 0, color: 'bg-orange-500', progress: 45 },
      { phase: '施工', count: byPhase['construction'] || 0, color: 'bg-cyan-500', progress: 80 },
    ]
  }, [stats])

  const isLoading = projectsLoading || statsLoading

  return (
    <div className="min-h-screen">
      <Header title="ダッシュボード" subtitle="プロジェクト全体の状況を確認" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  {isLoading ? (
                    <div className="h-9 flex items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">最近の案件</h2>
              <a href="/sales" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                すべて表示 <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件番号</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件名</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProjects.slice(0, 5).map((project) => (
                      <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                        <td className="py-3 px-4 text-sm font-medium text-primary-600">{project.projectNumber}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{project.name}</td>
                        <td className="py-3 px-4">
                          <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusLabels[project.status]?.color || 'bg-gray-100 text-gray-800')}>
                            {statusLabels[project.status]?.label || getStatusLabel(project.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {formatCurrency(project.estimatedAmount || project.contractAmount || 0)}
                        </td>
                      </tr>
                    ))}
                    {displayProjects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          案件データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alerts & Notifications */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">通知・アラート</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border-l-4',
                    alert.type === 'warning' && 'bg-yellow-50 border-yellow-400',
                    alert.type === 'info' && 'bg-blue-50 border-blue-400',
                    alert.type === 'success' && 'bg-green-50 border-green-400'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                    {alert.type === 'info' && <Clock className="w-4 h-4 text-blue-500 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Overview */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">フェーズ別進捗</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {phaseData.map((item) => (
              <div key={item.phase} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.phase}</span>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{item.count}件</span>
                  )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', item.color)}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">平均進捗: {item.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Indicator */}
        {projects.length === 0 && !projectsLoading && (
          <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-3">
            デモデータを表示中です。Firestoreにデータを追加すると実データが表示されます。
          </div>
        )}
      </div>
    </div>
  )
}
