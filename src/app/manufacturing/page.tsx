'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import ProductionProcessForm from '@/components/ProductionProcessForm'
import MaterialForm from '@/components/MaterialForm'
import { useProductionProcesses, useMaterials, useProjects, createProductionProcess, createMaterial } from '@/hooks'
import { updateDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore'
import { Package, Clock, CheckCircle2, AlertTriangle, Plus, Loader2, Edit, Trash2, MoreVertical } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { ProductionProcess, Material } from '@/types'

const statusColors = {
  completed: 'bg-green-500',
  in_progress: 'bg-blue-500',
  pending: 'bg-gray-300',
  delayed: 'bg-red-500',
}

const statusLabels = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
  delayed: '遅延',
}

const materialStatusLabels = {
  pending: { label: '未発注', color: 'bg-gray-100 text-gray-800' },
  ordered: { label: '発注済', color: 'bg-yellow-100 text-yellow-800' },
  received: { label: '入荷済', color: 'bg-green-100 text-green-800' },
  used: { label: '使用済', color: 'bg-blue-100 text-blue-800' },
}

// デモデータ
const demoProcesses: ProductionProcess[] = [
  {
    id: '1',
    projectId: 'demo-1',
    name: '裁断',
    sequence: 1,
    plannedStartDate: new Date('2024-02-01'),
    plannedEndDate: new Date('2024-02-05'),
    status: 'completed',
    progress: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'demo-1',
    name: '縫製',
    sequence: 2,
    plannedStartDate: new Date('2024-02-05'),
    plannedEndDate: new Date('2024-02-15'),
    status: 'in_progress',
    progress: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const demoMaterials: Material[] = [
  {
    id: '1',
    projectId: 'demo-1',
    name: 'PTFE膜材 (白)',
    specification: '1.0mm厚',
    quantity: 500,
    unit: 'm²',
    status: 'received',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'demo-1',
    name: 'ステンレスケーブル φ12',
    specification: 'SUS304',
    quantity: 200,
    unit: 'm',
    status: 'ordered',
    expectedDate: new Date('2024-02-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ManufacturingPage() {
  const { processes: firestoreProcesses, loading: processLoading, refetch: refetchProcesses } = useProductionProcesses()
  const { materials: firestoreMaterials, loading: materialLoading, refetch: refetchMaterials } = useMaterials()
  const { projects } = useProjects()

  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [showProcessForm, setShowProcessForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [editingProcess, setEditingProcess] = useState<ProductionProcess | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeProcessMenu, setActiveProcessMenu] = useState<string | null>(null)
  const [activeMaterialMenu, setActiveMaterialMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'process' | 'material', id: string} | null>(null)

  // Firestoreデータがない場合はデモデータを使用
  const processes = firestoreProcesses.length > 0 ? firestoreProcesses : demoProcesses
  const materials = firestoreMaterials.length > 0 ? firestoreMaterials : demoMaterials

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => selectedProject === 'all' || p.projectId === selectedProject)
  }, [processes, selectedProject])

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => selectedProject === 'all' || m.projectId === selectedProject)
  }, [materials, selectedProject])

  // 統計計算
  const stats = {
    totalProcesses: processes.length,
    onTrack: processes.filter(p => p.status === 'completed' || p.status === 'in_progress').length,
    delayed: processes.filter(p => p.status === 'delayed').length,
    avgProgress: processes.length > 0
      ? Math.round(processes.reduce((sum, p) => sum + p.progress, 0) / processes.length)
      : 0,
  }

  // プロジェクトごとにグループ化
  const groupedProcesses = useMemo(() => {
    const groups: Record<string, ProductionProcess[]> = {}
    filteredProcesses.forEach(p => {
      if (!groups[p.projectId]) groups[p.projectId] = []
      groups[p.projectId].push(p)
    })
    return groups
  }, [filteredProcesses])

  const handleCreateProcess = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createProductionProcess(data as Omit<ProductionProcess, 'id' | 'createdAt' | 'updatedAt'>)
      setShowProcessForm(false)
      refetchProcesses()
    } catch (error) {
      console.error('Failed to create process:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditProcess = async (data: Record<string, unknown>) => {
    if (!editingProcess) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.PRODUCTION_PROCESSES, editingProcess.id, data)
      setEditingProcess(null)
      refetchProcesses()
    } catch (error) {
      console.error('Failed to update process:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateMaterial = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createMaterial(data as Omit<Material, 'id' | 'createdAt' | 'updatedAt'>)
      setShowMaterialForm(false)
      refetchMaterials()
    } catch (error) {
      console.error('Failed to create material:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditMaterial = async (data: Record<string, unknown>) => {
    if (!editingMaterial) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.MATERIALS, editingMaterial.id, data)
      setEditingMaterial(null)
      refetchMaterials()
    } catch (error) {
      console.error('Failed to update material:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === 'process') {
        await deleteDocument(COLLECTIONS.PRODUCTION_PROCESSES, deleteConfirm.id)
        refetchProcesses()
      } else {
        await deleteDocument(COLLECTIONS.MATERIALS, deleteConfirm.id)
        refetchMaterials()
      }
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const loading = processLoading || materialLoading

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
                <p className="text-sm text-gray-500">総工程数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProcesses}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均進捗</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center justify-between">
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowProcessForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              工程追加
            </button>
            <button
              onClick={() => setShowMaterialForm(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              材料追加
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Production Progress */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">製造進捗</h2>
              {Object.keys(groupedProcesses).length === 0 ? (
                <p className="text-gray-500 text-center py-8">工程がありません</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedProcesses).map(([projectId, projectProcesses]) => {
                    const project = projects.find(p => p.id === projectId)
                    const overallProgress = Math.round(
                      projectProcesses.reduce((sum, p) => sum + p.progress, 0) / projectProcesses.length
                    )
                    const hasDelay = projectProcesses.some(p => p.status === 'delayed')

                    return (
                      <div key={projectId} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary-600">
                                {project?.projectNumber || projectId}
                              </span>
                              {hasDelay && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  遅延あり
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900 font-medium mt-1">{project?.name || '不明なプロジェクト'}</p>
                          </div>
                        </div>

                        {/* Process Steps */}
                        <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                          {projectProcesses.sort((a, b) => a.sequence - b.sequence).map((process, index) => (
                            <div key={process.id} className="flex items-center">
                              <div className="flex flex-col items-center relative">
                                <div
                                  className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer',
                                    process.status === 'completed' && 'bg-green-500 text-white',
                                    process.status === 'in_progress' && 'bg-blue-500 text-white',
                                    process.status === 'pending' && 'bg-gray-200 text-gray-500',
                                    process.status === 'delayed' && 'bg-red-500 text-white'
                                  )}
                                  onClick={() => setActiveProcessMenu(activeProcessMenu === process.id ? null : process.id)}
                                >
                                  {process.status === 'completed' ? '✓' : index + 1}
                                </div>
                                <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">{process.name}</span>
                                {activeProcessMenu === process.id && (
                                  <div className="absolute top-10 left-0 w-28 bg-white border rounded-lg shadow-lg z-10">
                                    <button
                                      onClick={() => { setEditingProcess(process); setActiveProcessMenu(null) }}
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit className="w-3 h-3" /> 編集
                                    </button>
                                    <button
                                      onClick={() => { setDeleteConfirm({ type: 'process', id: process.id }); setActiveProcessMenu(null) }}
                                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3 h-3" /> 削除
                                    </button>
                                  </div>
                                )}
                              </div>
                              {index < projectProcesses.length - 1 && (
                                <div className="w-8 h-0.5 bg-gray-200 mx-1 mt-[-12px]">
                                  <div
                                    className={cn('h-full', statusColors[process.status])}
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
                            <span className="font-medium text-gray-900">{overallProgress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                hasDelay ? 'bg-red-500' : 'bg-green-500'
                              )}
                              style={{ width: `${overallProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Materials */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">材料管理</h2>
              {filteredMaterials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">材料がありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">材料名</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">仕様</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">数量</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ステータス</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">入荷予定</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMaterials.map((material) => {
                        const status = materialStatusLabels[material.status]
                        return (
                          <tr key={material.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{material.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{material.specification}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 text-right">
                              {material.quantity} {material.unit}
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', status.color)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {material.expectedDate ? formatDate(material.expectedDate) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                onClick={() => setActiveMaterialMenu(activeMaterialMenu === material.id ? null : material.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                              {activeMaterialMenu === material.id && (
                                <div className="absolute right-4 mt-1 w-28 bg-white border rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => { setEditingMaterial(material); setActiveMaterialMenu(null) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3 h-3" /> 編集
                                  </button>
                                  <button
                                    onClick={() => { setDeleteConfirm({ type: 'material', id: material.id }); setActiveMaterialMenu(null) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" /> 削除
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Forms */}
      {showProcessForm && (
        <ProductionProcessForm
          projectId={selectedProject === 'all' ? '' : selectedProject}
          onSubmit={handleCreateProcess}
          onCancel={() => setShowProcessForm(false)}
          isLoading={formLoading}
        />
      )}

      {editingProcess && (
        <ProductionProcessForm
          projectId={editingProcess.projectId}
          process={editingProcess}
          onSubmit={handleEditProcess}
          onCancel={() => setEditingProcess(null)}
          isLoading={formLoading}
        />
      )}

      {showMaterialForm && (
        <MaterialForm
          projectId={selectedProject === 'all' ? '' : selectedProject}
          onSubmit={handleCreateMaterial}
          onCancel={() => setShowMaterialForm(false)}
          isLoading={formLoading}
        />
      )}

      {editingMaterial && (
        <MaterialForm
          projectId={editingMaterial.projectId}
          material={editingMaterial}
          onSubmit={handleEditMaterial}
          onCancel={() => setEditingMaterial(null)}
          isLoading={formLoading}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {deleteConfirm.type === 'process' ? '工程を削除' : '材料を削除'}
            </h3>
            <p className="text-gray-600 mb-6">削除してもよろしいですか？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                キャンセル
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg">
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
