'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { Plus, Filter, Search, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { cn, formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'

// ダミーデータ
const projects: (Project & { customerName: string })[] = [
  {
    id: '1',
    projectNumber: 'YS-2024-042',
    name: '○○スタジアム膜屋根',
    customerId: '1',
    customerName: '株式会社ABC建設',
    status: 'designing',
    currentPhase: 'design',
    location: '東京都新宿区',
    structureType: '大型膜屋根',
    estimatedArea: 5000,
    estimatedAmount: 45000000,
    inquiryDate: new Date('2024-01-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectNumber: 'YS-2024-041',
    name: '△△商業施設エントランス',
    customerId: '2',
    customerName: '△△不動産',
    status: 'manufacturing',
    currentPhase: 'manufacturing',
    location: '大阪府大阪市',
    structureType: 'エントランス膜',
    estimatedArea: 800,
    estimatedAmount: 28000000,
    inquiryDate: new Date('2024-01-05'),
    contractDate: new Date('2024-01-20'),
    contractAmount: 27500000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    projectNumber: 'YS-2024-040',
    name: '□□公園パーゴラ',
    customerId: '3',
    customerName: '□□市役所',
    status: 'installing',
    currentPhase: 'construction',
    location: '愛知県名古屋市',
    structureType: 'パーゴラ',
    estimatedArea: 200,
    estimatedAmount: 12000000,
    contractAmount: 11800000,
    inquiryDate: new Date('2023-12-15'),
    contractDate: new Date('2024-01-10'),
    deliveryDate: new Date('2024-02-28'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    projectNumber: 'YS-2024-039',
    name: '○△倉庫テント',
    customerId: '4',
    customerName: '○△物流',
    status: 'estimating',
    currentPhase: 'sales',
    location: '福岡県福岡市',
    structureType: '倉庫テント',
    estimatedArea: 1500,
    estimatedAmount: 8500000,
    inquiryDate: new Date('2024-01-18'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    projectNumber: 'YS-2024-038',
    name: '××スポーツ施設',
    customerId: '5',
    customerName: '××スポーツクラブ',
    status: 'negotiating',
    currentPhase: 'sales',
    location: '神奈川県横浜市',
    structureType: 'スポーツ施設膜屋根',
    estimatedArea: 2000,
    estimatedAmount: 35000000,
    inquiryDate: new Date('2024-01-12'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const statusFilters: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'inquiry', label: '問い合わせ' },
  { value: 'estimating', label: '見積中' },
  { value: 'negotiating', label: '商談中' },
  { value: 'contracted', label: '契約済' },
  { value: 'designing', label: '設計中' },
  { value: 'manufacturing', label: '製造中' },
  { value: 'installing', label: '施工中' },
  { value: 'completed', label: '完了' },
]

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen">
      <Header title="営業管理" subtitle="案件一覧と進捗管理" />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="案件番号、案件名、顧客名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新規案件
          </button>
        </div>

        {/* Projects Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件番号</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件名</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">顧客</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">施工場所</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">見積金額</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">問合せ日</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-primary-600">{project.projectNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.structureType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{project.customerName}</td>
                    <td className="py-4 px-4">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', getStatusColor(project.status))}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{project.location}</td>
                    <td className="py-4 px-4 text-sm text-gray-900 text-right">
                      {project.estimatedAmount ? formatCurrency(project.estimatedAmount) : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{formatDate(project.inquiryDate)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {filteredProjects.length} 件中 1-{filteredProjects.length} 件を表示
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                前へ
              </button>
              <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
