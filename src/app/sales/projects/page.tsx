'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProjectForm from '@/components/ProjectForm'
import { useProjects, createProject } from '@/hooks'
import { updateDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore'
import {
  Plus,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { cn, formatCurrency, getStatusLabel, formatDate } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types'

const statusColors: Record<ProjectStatus, string> = {
  inquiry: 'bg-gray-100 text-gray-800',
  estimating: 'bg-yellow-100 text-yellow-800',
  negotiating: 'bg-blue-100 text-blue-800',
  contracted: 'bg-green-100 text-green-800',
  designing: 'bg-purple-100 text-purple-800',
  manufacturing: 'bg-orange-100 text-orange-800',
  installing: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<ProjectStatus, string> = {
  inquiry: '問い合わせ',
  estimating: '見積中',
  negotiating: '商談中',
  contracted: '契約済',
  designing: '設計中',
  manufacturing: '製造中',
  installing: '施工中',
  completed: '完了',
  cancelled: 'キャンセル',
}

export default function ProjectsPage() {
  const router = useRouter()
  const { projects, loading, refetch } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // フィルタリング
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === '' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  // 新規作成
  const handleCreate = async (data: Record<string, unknown> & { projectNumber: string }) => {
    setFormLoading(true)
    try {
      await createProject({
        ...data,
        inquiryDate: new Date(),
      } as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // 編集
  const handleEdit = async (data: Partial<Project>) => {
    if (!editingProject) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.PROJECTS, editingProject.id, data)
      setEditingProject(null)
      refetch()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.PROJECTS, id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="案件管理" subtitle="案件の作成・編集・管理" />

      <div className="p-6">
        {/* ツールバー */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="案件名または案件番号で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white"
              >
                <option value="">全てのステータス</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </button>
          </div>
        </div>

        {/* テーブル */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || statusFilter ? '該当する案件がありません' : '案件がありません'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件番号</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">案件名</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">施工場所</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">金額</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-primary-600">
                        {project.projectNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{project.name}</td>
                      <td className="py-3 px-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[project.status])}>
                          {statusLabels[project.status] || getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{project.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {formatCurrency(project.contractAmount || project.estimatedAmount || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {activeMenu === project.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  router.push(`/sales/projects/${project.id}`)
                                  setActiveMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                詳細
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProject(project)
                                  setActiveMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                編集
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm(project.id)
                                  setActiveMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                削除
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 件数表示 */}
        <div className="mt-4 text-sm text-gray-500">
          {filteredProjects.length} 件の案件
        </div>
      </div>

      {/* 新規作成フォーム */}
      {showForm && (
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={formLoading}
        />
      )}

      {/* 編集フォーム */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleEdit}
          onCancel={() => setEditingProject(null)}
          isLoading={formLoading}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">案件を削除</h3>
            <p className="text-gray-600 mb-6">この案件を削除してもよろしいですか？この操作は取り消せません。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
