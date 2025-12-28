'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import DrawingForm from '@/components/DrawingForm'
import { useDrawings, useProjects, createDrawing } from '@/hooks'
import { updateDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore'
import { FileText, Upload, Check, Clock, AlertCircle, Eye, Download, MoreVertical, Loader2, Edit, Trash2, Plus } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Drawing } from '@/types'

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

// デモデータ
const demoDrawings: Drawing[] = [
  {
    id: '1',
    projectId: 'demo-1',
    drawingNumber: 'DWG-042-001',
    name: '平面図',
    type: 'plan',
    version: 3,
    fileUrl: '',
    status: 'approved',
    createdBy: '田中設計士',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    projectId: 'demo-1',
    drawingNumber: 'DWG-042-002',
    name: '立面図',
    type: 'elevation',
    version: 2,
    fileUrl: '',
    status: 'review',
    createdBy: '田中設計士',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: '3',
    projectId: 'demo-2',
    drawingNumber: 'DWG-042-003',
    name: '構造詳細図',
    type: 'structural',
    version: 1,
    fileUrl: '',
    status: 'draft',
    createdBy: '佐藤設計士',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
]

export default function DesignPage() {
  const { drawings: firestoreDrawings, loading, refetch } = useDrawings()
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingDrawing, setEditingDrawing] = useState<Drawing | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Firestoreデータがない場合はデモデータを使用
  const drawings = firestoreDrawings.length > 0 ? firestoreDrawings : demoDrawings

  const filteredDrawings = useMemo(() => {
    return drawings.filter(d => selectedProject === 'all' || d.projectId === selectedProject)
  }, [drawings, selectedProject])

  const stats = {
    total: drawings.length,
    approved: drawings.filter(d => d.status === 'approved').length,
    review: drawings.filter(d => d.status === 'review').length,
    draft: drawings.filter(d => d.status === 'draft').length,
  }

  const handleCreate = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createDrawing(data as Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'>)
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Failed to create drawing:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editingDrawing) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.DRAWINGS, editingDrawing.id, data)
      setEditingDrawing(null)
      refetch()
    } catch (error) {
      console.error('Failed to update drawing:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.DRAWINGS, id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete drawing:', error)
    }
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
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectNumber} - {p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            図面登録
          </button>
        </div>

        {/* Drawings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredDrawings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            図面がありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrawings.map((drawing) => {
              const status = statusConfig[drawing.status]
              const project = projects.find(p => p.id === drawing.projectId)
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
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === drawing.id ? null : drawing.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === drawing.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => { setEditingDrawing(drawing); setActiveMenu(null) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> 編集
                          </button>
                          <button
                            onClick={() => { setDeleteConfirm(drawing.id); setActiveMenu(null) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> 削除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">プロジェクト</span>
                      <span className="text-gray-900">{project?.projectNumber || '-'}</span>
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
        )}

        <div className="text-sm text-gray-500">{filteredDrawings.length} 件の図面</div>
      </div>

      {showForm && (
        <DrawingForm
          projectId={selectedProject === 'all' ? '' : selectedProject}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isLoading={formLoading}
        />
      )}

      {editingDrawing && (
        <DrawingForm
          projectId={editingDrawing.projectId}
          drawing={editingDrawing}
          onSubmit={handleEdit}
          onCancel={() => setEditingDrawing(null)}
          isLoading={formLoading}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">図面を削除</h3>
            <p className="text-gray-600 mb-6">この図面を削除してもよろしいですか？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">キャンセル</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg">削除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
