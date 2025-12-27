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
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

// ダミーデータ
const stats = [
  {
    name: '進行中案件',
    value: '24',
    change: '+3',
    changeType: 'increase',
    icon: TrendingUp,
    color: 'bg-blue-500',
  },
  {
    name: '見積中',
    value: '8',
    change: '+2',
    changeType: 'increase',
    icon: FileText,
    color: 'bg-yellow-500',
  },
  {
    name: '製造中',
    value: '6',
    change: '0',
    changeType: 'neutral',
    icon: Factory,
    color: 'bg-orange-500',
  },
  {
    name: '施工中',
    value: '4',
    change: '-1',
    changeType: 'decrease',
    icon: HardHat,
    color: 'bg-cyan-500',
  },
]

const recentProjects = [
  {
    id: 1,
    projectNumber: 'YS-2024-042',
    name: '○○スタジアム膜屋根',
    customer: '株式会社ABC建設',
    status: 'designing',
    amount: 45000000,
    dueDate: '2024-03-15',
  },
  {
    id: 2,
    projectNumber: 'YS-2024-041',
    name: '△△商業施設エントランス',
    customer: '△△不動産',
    status: 'manufacturing',
    amount: 28000000,
    dueDate: '2024-02-28',
  },
  {
    id: 3,
    projectNumber: 'YS-2024-040',
    name: '□□公園パーゴラ',
    customer: '□□市役所',
    status: 'installing',
    amount: 12000000,
    dueDate: '2024-02-10',
  },
  {
    id: 4,
    projectNumber: 'YS-2024-039',
    name: '○△倉庫テント',
    customer: '○△物流',
    status: 'estimating',
    amount: 8500000,
    dueDate: '2024-01-30',
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

const statusLabels: Record<string, { label: string; color: string }> = {
  estimating: { label: '見積中', color: 'bg-yellow-100 text-yellow-800' },
  designing: { label: '設計中', color: 'bg-purple-100 text-purple-800' },
  manufacturing: { label: '製造中', color: 'bg-orange-100 text-orange-800' },
  installing: { label: '施工中', color: 'bg-cyan-100 text-cyan-800' },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header title="ダッシュボード" subtitle="プロジェクト全体の状況を確認" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span
                  className={cn(
                    'font-medium',
                    stat.changeType === 'increase' && 'text-green-600',
                    stat.changeType === 'decrease' && 'text-red-600',
                    stat.changeType === 'neutral' && 'text-gray-500'
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">先月比</span>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件番号</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件名</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">顧客</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4 text-sm font-medium text-primary-600">{project.projectNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{project.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{project.customer}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusLabels[project.status].color)}>
                          {statusLabels[project.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(project.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            {[
              { phase: '営業', count: 8, color: 'bg-blue-500', progress: 75 },
              { phase: '設計', count: 6, color: 'bg-purple-500', progress: 60 },
              { phase: '製造', count: 6, color: 'bg-orange-500', progress: 45 },
              { phase: '施工', count: 4, color: 'bg-cyan-500', progress: 80 },
            ].map((item) => (
              <div key={item.phase} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.phase}</span>
                  <span className="text-sm font-bold text-gray-900">{item.count}件</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', item.color)}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">平均進捗: {item.progress}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
