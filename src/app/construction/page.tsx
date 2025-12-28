'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import ConstructionScheduleForm from '@/components/ConstructionScheduleForm'
import InspectionForm from '@/components/InspectionForm'
import { useConstructionSchedules, useInspections, useProjects, createConstructionSchedule, createInspection } from '@/hooks'
import { updateDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore'
import { HardHat, MapPin, Calendar, Users, CheckCircle, Clock, Plus, Loader2, Edit, Trash2, MoreVertical, ClipboardCheck } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { ConstructionSchedule, Inspection } from '@/types'

const statusConfig = {
  pending: { label: '施工予定', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: '施工中', color: 'bg-cyan-100 text-cyan-800' },
  completed: { label: '完了', color: 'bg-green-100 text-green-800' },
  delayed: { label: '遅延', color: 'bg-red-100 text-red-800' },
}

const taskStatusIcons = {
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-blue-500" />,
  pending: <div className="w-4 h-4 rounded-full border-2 border-gray-300" />,
}

const inspectionTypeLabels = {
  material: '材料検査',
  production: '製造検査',
  installation: '施工検査',
  final: '最終検査',
}

// デモデータ
const demoSchedules: ConstructionSchedule[] = [
  {
    id: '1',
    projectId: 'demo-1',
    tasks: [
      { id: 't1', name: '基礎工事', sequence: 1, plannedStartDate: new Date('2024-02-01'), plannedEndDate: new Date('2024-02-05'), status: 'completed' },
      { id: 't2', name: 'フレーム組立', sequence: 2, plannedStartDate: new Date('2024-02-06'), plannedEndDate: new Date('2024-02-15'), status: 'in_progress' },
      { id: 't3', name: '膜張り', sequence: 3, plannedStartDate: new Date('2024-02-16'), plannedEndDate: new Date('2024-02-25'), status: 'pending' },
    ],
    plannedStartDate: new Date('2024-02-01'),
    plannedEndDate: new Date('2024-02-28'),
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const demoInspections: Inspection[] = [
  {
    id: '1',
    projectId: 'demo-1',
    type: 'installation',
    date: new Date('2024-02-15'),
    inspector: '品質管理部 鈴木',
    result: 'pass',
    checkItems: [
      { id: 'c1', item: 'フレーム接合', standard: '溶接部欠陥なし', result: 'pass' },
      { id: 'c2', item: 'ボルト締付', standard: 'トルク値規定内', result: 'pass' },
    ],
    notes: '問題なし',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ConstructionPage() {
  const { schedules: firestoreSchedules, loading: scheduleLoading, refetch: refetchSchedules } = useConstructionSchedules()
  const { inspections: firestoreInspections, loading: inspectionLoading, refetch: refetchInspections } = useInspections()
  const { projects } = useProjects()

  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [showInspectionForm, setShowInspectionForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ConstructionSchedule | null>(null)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeScheduleMenu, setActiveScheduleMenu] = useState<string | null>(null)
  const [activeInspectionMenu, setActiveInspectionMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'schedule' | 'inspection', id: string} | null>(null)

  // Firestoreデータがない場合はデモデータを使用
  const schedules = firestoreSchedules.length > 0 ? firestoreSchedules : demoSchedules
  const inspections = firestoreInspections.length > 0 ? firestoreInspections : demoInspections

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => selectedProject === 'all' || s.projectId === selectedProject)
  }, [schedules, selectedProject])

  const filteredInspections = useMemo(() => {
    return inspections.filter(i => selectedProject === 'all' || i.projectId === selectedProject)
  }, [inspections, selectedProject])

  // 統計計算
  const stats = {
    inProgress: schedules.filter(s => s.status === 'in_progress').length,
    scheduled: schedules.filter(s => s.status === 'pending').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    inspections: inspections.length,
  }

  const handleCreateSchedule = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createConstructionSchedule(data as Omit<ConstructionSchedule, 'id' | 'createdAt' | 'updatedAt'>)
      setShowScheduleForm(false)
      refetchSchedules()
    } catch (error) {
      console.error('Failed to create schedule:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSchedule = async (data: Record<string, unknown>) => {
    if (!editingSchedule) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.CONSTRUCTION_SCHEDULES, editingSchedule.id, data)
      setEditingSchedule(null)
      refetchSchedules()
    } catch (error) {
      console.error('Failed to update schedule:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCreateInspection = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createInspection(data as Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>)
      setShowInspectionForm(false)
      refetchInspections()
    } catch (error) {
      console.error('Failed to create inspection:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditInspection = async (data: Record<string, unknown>) => {
    if (!editingInspection) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.INSPECTIONS, editingInspection.id, data)
      setEditingInspection(null)
      refetchInspections()
    } catch (error) {
      console.error('Failed to update inspection:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === 'schedule') {
        await deleteDocument(COLLECTIONS.CONSTRUCTION_SCHEDULES, deleteConfirm.id)
        refetchSchedules()
      } else {
        await deleteDocument(COLLECTIONS.INSPECTIONS, deleteConfirm.id)
        refetchInspections()
      }
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const loading = scheduleLoading || inspectionLoading

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
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">予定</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">完了</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">検査記録</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inspections}</p>
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
              onClick={() => setShowScheduleForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              スケジュール作成
            </button>
            <button
              onClick={() => setShowInspectionForm(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              検査記録
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Construction Sites */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">施工現場一覧</h2>
              {filteredSchedules.length === 0 ? (
                <div className="card text-center py-8 text-gray-500">スケジュールがありません</div>
              ) : (
                filteredSchedules.map((schedule) => {
                  const status = statusConfig[schedule.status]
                  const project = projects.find(p => p.id === schedule.projectId)
                  const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length
                  const progress = Math.round((completedTasks / schedule.tasks.length) * 100)

                  return (
                    <div key={schedule.id} className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <HardHat className="w-6 h-6 text-cyan-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary-600">
                                {project?.projectNumber || schedule.projectId}
                              </span>
                              <span className={cn('px-2.5 py-0.5 text-xs font-medium rounded-full', status.color)}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-lg font-medium text-gray-900 mt-1">
                              {project?.name || '不明なプロジェクト'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              {project?.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {project.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(schedule.plannedStartDate)} - {formatDate(schedule.plannedEndDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setActiveScheduleMenu(activeScheduleMenu === schedule.id ? null : schedule.id)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {activeScheduleMenu === schedule.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-white border rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => { setEditingSchedule(schedule); setActiveScheduleMenu(null) }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-3 h-3" /> 編集
                              </button>
                              <button
                                onClick={() => { setDeleteConfirm({ type: 'schedule', id: schedule.id }); setActiveScheduleMenu(null) }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" /> 削除
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tasks Progress */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">施工進捗</span>
                          <span className="text-sm font-bold text-gray-900">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-6 overflow-x-auto">
                          {schedule.tasks.sort((a, b) => a.sequence - b.sequence).map((task, index) => (
                            <div key={task.id} className="flex items-center gap-2">
                              {taskStatusIcons[task.status]}
                              <span className={cn(
                                'text-sm whitespace-nowrap',
                                task.status === 'completed' && 'text-green-700',
                                task.status === 'in_progress' && 'text-blue-700 font-medium',
                                task.status === 'pending' && 'text-gray-400'
                              )}>
                                {task.name}
                              </span>
                              {index < schedule.tasks.length - 1 && (
                                <div className="w-8 h-px bg-gray-200 ml-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Recent Inspections */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">検査記録</h2>
              {filteredInspections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">検査記録がありません</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">プロジェクト</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査種別</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査日</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">検査員</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">結果</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInspections.map((inspection) => {
                        const project = projects.find(p => p.id === inspection.projectId)
                        return (
                          <tr key={inspection.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-primary-600">
                              {project?.projectNumber || inspection.projectId}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {inspectionTypeLabels[inspection.type]}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {formatDate(inspection.date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{inspection.inspector}</td>
                            <td className="py-3 px-4">
                              <span className={cn(
                                'px-2.5 py-1 text-xs font-medium rounded-full',
                                inspection.result === 'pass' && 'bg-green-100 text-green-800',
                                inspection.result === 'fail' && 'bg-red-100 text-red-800',
                                inspection.result === 'conditional' && 'bg-yellow-100 text-yellow-800'
                              )}>
                                {inspection.result === 'pass' ? '合格' : inspection.result === 'fail' ? '不合格' : '条件付'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                onClick={() => setActiveInspectionMenu(activeInspectionMenu === inspection.id ? null : inspection.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                              {activeInspectionMenu === inspection.id && (
                                <div className="absolute right-4 mt-1 w-28 bg-white border rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => { setEditingInspection(inspection); setActiveInspectionMenu(null) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3 h-3" /> 編集
                                  </button>
                                  <button
                                    onClick={() => { setDeleteConfirm({ type: 'inspection', id: inspection.id }); setActiveInspectionMenu(null) }}
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
      {showScheduleForm && (
        <ConstructionScheduleForm
          projectId={selectedProject === 'all' ? '' : selectedProject}
          onSubmit={handleCreateSchedule}
          onCancel={() => setShowScheduleForm(false)}
          isLoading={formLoading}
        />
      )}

      {editingSchedule && (
        <ConstructionScheduleForm
          projectId={editingSchedule.projectId}
          schedule={editingSchedule}
          onSubmit={handleEditSchedule}
          onCancel={() => setEditingSchedule(null)}
          isLoading={formLoading}
        />
      )}

      {showInspectionForm && (
        <InspectionForm
          projectId={selectedProject === 'all' ? '' : selectedProject}
          onSubmit={handleCreateInspection}
          onCancel={() => setShowInspectionForm(false)}
          isLoading={formLoading}
        />
      )}

      {editingInspection && (
        <InspectionForm
          projectId={editingInspection.projectId}
          inspection={editingInspection}
          onSubmit={handleEditInspection}
          onCancel={() => setEditingInspection(null)}
          isLoading={formLoading}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {deleteConfirm.type === 'schedule' ? 'スケジュールを削除' : '検査記録を削除'}
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
