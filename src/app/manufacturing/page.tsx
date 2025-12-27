'use client'

import Header from '@/components/Header'
import { Package, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

// ダミーデータ
const productionProjects = [
  {
    id: '1',
    projectNumber: 'YS-2024-041',
    projectName: '△△商業施設エントランス',
    processes: [
      { name: '材料検収', status: 'completed', progress: 100 },
      { name: '裁断', status: 'completed', progress: 100 },
      { name: '縫製', status: 'in_progress', progress: 75 },
      { name: '金物取付', status: 'pending', progress: 0 },
      { name: '検査', status: 'pending', progress: 0 },
    ],
    overallProgress: 55,
    dueDate: new Date('2024-02-20'),
    status: 'on_track',
  },
  {
    id: '2',
    projectNumber: 'YS-2024-040',
    projectName: '□□公園パーゴラ',
    processes: [
      { name: '材料検収', status: 'completed', progress: 100 },
      { name: '裁断', status: 'completed', progress: 100 },
      { name: '縫製', status: 'completed', progress: 100 },
      { name: '金物取付', status: 'completed', progress: 100 },
      { name: '検査', status: 'in_progress', progress: 50 },
    ],
    overallProgress: 90,
    dueDate: new Date('2024-02-10'),
    status: 'on_track',
  },
  {
    id: '3',
    projectNumber: 'YS-2024-038',
    projectName: '××スポーツ施設（製造待ち）',
    processes: [
      { name: '材料検収', status: 'delayed', progress: 0 },
      { name: '裁断', status: 'pending', progress: 0 },
      { name: '縫製', status: 'pending', progress: 0 },
      { name: '金物取付', status: 'pending', progress: 0 },
      { name: '検査', status: 'pending', progress: 0 },
    ],
    overallProgress: 0,
    dueDate: new Date('2024-03-15'),
    status: 'delayed',
    delayReason: '材料入荷遅延（2日）',
  },
]

const materials = [
  { id: '1', name: 'PTFE膜材 (白)', quantity: 500, unit: 'm²', status: 'received', project: 'YS-2024-041' },
  { id: '2', name: 'ステンレスケーブル φ12', quantity: 200, unit: 'm', status: 'received', project: 'YS-2024-041' },
  { id: '3', name: 'ETFE膜材 (透明)', quantity: 300, unit: 'm²', status: 'ordered', project: 'YS-2024-038', eta: '2024-01-30' },
  { id: '4', name: 'アルミフレーム', quantity: 50, unit: '本', status: 'pending', project: 'YS-2024-038' },
]

const statusColors = {
  completed: 'bg-green-500',
  in_progress: 'bg-blue-500',
  pending: 'bg-gray-300',
  delayed: 'bg-red-500',
}

const materialStatusLabels = {
  pending: { label: '未発注', color: 'bg-gray-100 text-gray-800' },
  ordered: { label: '発注済', color: 'bg-yellow-100 text-yellow-800' },
  received: { label: '入荷済', color: 'bg-green-100 text-green-800' },
}

export default function ManufacturingPage() {
  return (
    <div className="min-h-screen">
      <Header title="製造管理" subtitle="工程・材料・進捗管理" />

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">製造中案件</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">順調</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">遅延</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">今週納期</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Production Progress */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">製造進捗</h2>
          <div className="space-y-6">
            {productionProjects.map((project) => (
              <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary-600">{project.projectNumber}</span>
                      {project.status === 'delayed' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          遅延
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium mt-1">{project.projectName}</p>
                    {project.delayReason && (
                      <p className="text-sm text-red-600 mt-1">{project.delayReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">納期</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(project.dueDate)}</p>
                  </div>
                </div>

                {/* Process Steps */}
                <div className="flex items-center gap-2 mb-3">
                  {project.processes.map((process, index) => (
                    <div key={process.name} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                            process.status === 'completed' && 'bg-green-500 text-white',
                            process.status === 'in_progress' && 'bg-blue-500 text-white',
                            process.status === 'pending' && 'bg-gray-200 text-gray-500',
                            process.status === 'delayed' && 'bg-red-500 text-white'
                          )}
                        >
                          {process.status === 'completed' ? '✓' : index + 1}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{process.name}</span>
                      </div>
                      {index < project.processes.length - 1 && (
                        <div className="w-8 h-0.5 bg-gray-200 mx-1 mt-[-12px]">
                          <div
                            className={cn('h-full', statusColors[process.status as keyof typeof statusColors])}
                            style={{ width: `${process.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">全体進捗</span>
                    <span className="font-medium text-gray-900">{project.overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        project.status === 'delayed' ? 'bg-red-500' : 'bg-green-500'
                      )}
                      style={{ width: `${project.overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">材料管理</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">材料名</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">数量</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">入荷予定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((material) => {
                  const status = materialStatusLabels[material.status as keyof typeof materialStatusLabels]
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{material.name}</td>
                      <td className="py-3 px-4 text-sm text-primary-600">{material.project}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {material.quantity} {material.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {material.eta || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
