'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { FileText, Upload, Check, Clock, AlertCircle, Eye, Download, MoreVertical } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

// ダミーデータ
const drawings = [
  {
    id: '1',
    projectNumber: 'YS-2024-042',
    projectName: '○○スタジアム膜屋根',
    drawingNumber: 'DWG-042-001',
    name: '平面図',
    type: 'plan',
    version: 3,
    status: 'approved',
    createdBy: '田中設計士',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    projectNumber: 'YS-2024-042',
    projectName: '○○スタジアム膜屋根',
    drawingNumber: 'DWG-042-002',
    name: '立面図',
    type: 'elevation',
    version: 2,
    status: 'review',
    createdBy: '田中設計士',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '3',
    projectNumber: 'YS-2024-042',
    projectName: '○○スタジアム膜屋根',
    drawingNumber: 'DWG-042-003',
    name: '構造詳細図',
    type: 'structural',
    version: 1,
    status: 'draft',
    createdBy: '佐藤設計士',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '4',
    projectNumber: 'YS-2024-041',
    projectName: '△△商業施設エントランス',
    drawingNumber: 'DWG-041-001',
    name: '平面図',
    type: 'plan',
    version: 4,
    status: 'approved',
    createdBy: '鈴木設計士',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    projectNumber: 'YS-2024-041',
    projectName: '△△商業施設エントランス',
    drawingNumber: 'DWG-041-002',
    name: '詳細図',
    type: 'detail',
    version: 2,
    status: 'approved',
    createdBy: '鈴木設計士',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
]

const statusConfig = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800', icon: FileText },
  review: { label: 'レビュー中', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: '承認済', color: 'bg-green-100 text-green-800', icon: Check },
  revision: { label: '修正中', color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

const typeLabels: Record<string, string> = {
  plan: '平面図',
  elevation: '立面図',
  detail: '詳細図',
  structural: '構造図',
  other: 'その他',
}

export default function DesignPage() {
  const [selectedProject, setSelectedProject] = useState<string>('all')

  const projects = [...new Set(drawings.map((d) => d.projectNumber))]

  const filteredDrawings = drawings.filter(
    (d) => selectedProject === 'all' || d.projectNumber === selectedProject
  )

  const stats = {
    total: drawings.length,
    approved: drawings.filter((d) => d.status === 'approved').length,
    review: drawings.filter((d) => d.status === 'review').length,
    draft: drawings.filter((d) => d.status === 'draft').length,
  }

  return (
    <div className="min-h-screen">
      <Header title="設計管理" subtitle="図面・仕様書の管理" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">総図面数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">承認済</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">レビュー中</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.review}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">下書き</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</p>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">すべてのプロジェクト</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            図面アップロード
          </button>
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrawings.map((drawing) => {
            const status = statusConfig[drawing.status as keyof typeof statusConfig]
            return (
              <div key={drawing.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{drawing.name}</p>
                      <p className="text-xs text-gray-500">{drawing.drawingNumber}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">プロジェクト</span>
                    <span className="text-gray-900">{drawing.projectNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">種類</span>
                    <span className="text-gray-900">{typeLabels[drawing.type]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">バージョン</span>
                    <span className="text-gray-900">v{drawing.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">作成者</span>
                    <span className="text-gray-900">{drawing.createdBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">更新日</span>
                    <span className="text-gray-900">{formatDate(drawing.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', status.color)}>
                    {status.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
