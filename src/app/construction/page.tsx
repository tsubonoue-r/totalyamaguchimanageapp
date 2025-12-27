'use client'

import Header from '@/components/Header'
import { HardHat, MapPin, Calendar, Users, CheckCircle, Clock, AlertCircle, Camera } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

// ダミーデータ
const constructionSites = [
  {
    id: '1',
    projectNumber: 'YS-2024-040',
    projectName: '□□公園パーゴラ',
    location: '愛知県名古屋市緑区',
    status: 'in_progress',
    progress: 85,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
    team: '施工チームA',
    manager: '山田現場監督',
    tasks: [
      { name: '基礎工事', status: 'completed' },
      { name: 'フレーム組立', status: 'completed' },
      { name: '膜張り', status: 'in_progress' },
      { name: '最終検査', status: 'pending' },
    ],
    weather: '晴れ',
    safetyStatus: 'good',
  },
  {
    id: '2',
    projectNumber: 'YS-2024-037',
    projectName: '◇◇工場テント',
    location: '静岡県浜松市',
    status: 'completed',
    progress: 100,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-25'),
    team: '施工チームB',
    manager: '佐藤現場監督',
    tasks: [
      { name: '基礎工事', status: 'completed' },
      { name: 'フレーム組立', status: 'completed' },
      { name: '膜張り', status: 'completed' },
      { name: '最終検査', status: 'completed' },
    ],
    weather: '-',
    safetyStatus: 'good',
  },
  {
    id: '3',
    projectNumber: 'YS-2024-041',
    projectName: '△△商業施設エントランス',
    location: '大阪府大阪市北区',
    status: 'scheduled',
    progress: 0,
    startDate: new Date('2024-02-25'),
    endDate: new Date('2024-03-10'),
    team: '施工チームC',
    manager: '未定',
    tasks: [
      { name: '基礎工事', status: 'pending' },
      { name: 'フレーム組立', status: 'pending' },
      { name: '膜張り', status: 'pending' },
      { name: '最終検査', status: 'pending' },
    ],
    weather: '-',
    safetyStatus: 'na',
  },
]

const inspections = [
  {
    id: '1',
    projectNumber: 'YS-2024-040',
    type: '中間検査',
    date: new Date('2024-02-15'),
    inspector: '品質管理部 鈴木',
    result: 'pass',
    notes: '問題なし',
  },
  {
    id: '2',
    projectNumber: 'YS-2024-037',
    type: '完了検査',
    date: new Date('2024-01-25'),
    inspector: '品質管理部 高橋',
    result: 'pass',
    notes: '施工完了確認',
  },
]

const statusConfig = {
  scheduled: { label: '施工予定', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: '施工中', color: 'bg-cyan-100 text-cyan-800' },
  completed: { label: '完了', color: 'bg-green-100 text-green-800' },
  delayed: { label: '遅延', color: 'bg-red-100 text-red-800' },
}

const taskStatusIcons = {
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  pending: <div className="w-4 h-4 rounded-full border-2 border-gray-300" />,
}

export default function ConstructionPage() {
  return (
    <div className="min-h-screen">
      <Header title="施工管理" subtitle="現場スケジュール・進捗・検査管理" />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">施工中</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">今月予定</p>
                <p className="text-2xl font-bold text-blue-600">2</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">今月完了</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">稼働チーム</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Construction Sites */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">施工現場一覧</h2>
          {constructionSites.map((site) => {
            const status = statusConfig[site.status as keyof typeof statusConfig]
            return (
              <div key={site.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <HardHat className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary-600">{site.projectNumber}</span>
                        <span className={cn('px-2.5 py-0.5 text-xs font-medium rounded-full', status.color)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-gray-900 mt-1">{site.projectName}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {site.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {site.team}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(site.startDate)} - {formatDate(site.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4" />
                      写真
                    </button>
                  </div>
                </div>

                {/* Tasks Progress */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">施工進捗</span>
                    <span className="text-sm font-bold text-gray-900">{site.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    {site.tasks.map((task, index) => (
                      <div key={task.name} className="flex items-center gap-2">
                        {taskStatusIcons[task.status as keyof typeof taskStatusIcons]}
                        <span className={cn(
                          'text-sm',
                          task.status === 'completed' && 'text-green-700',
                          task.status === 'in_progress' && 'text-blue-700 font-medium',
                          task.status === 'pending' && 'text-gray-400'
                        )}>
                          {task.name}
                        </span>
                        {index < site.tasks.length - 1 && (
                          <div className="w-8 h-px bg-gray-200 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Inspections */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">最近の検査記録</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件番号</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査種別</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査日</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査員</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">結果</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">備考</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-primary-600">{inspection.projectNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{inspection.type}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(inspection.date)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{inspection.inspector}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        inspection.result === 'pass' && 'bg-green-100 text-green-800',
                        inspection.result === 'fail' && 'bg-red-100 text-red-800'
                      )}>
                        {inspection.result === 'pass' ? '合格' : '不合格'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{inspection.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
