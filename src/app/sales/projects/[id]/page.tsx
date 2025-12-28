'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProjectForm from '@/components/ProjectForm'
import { useProject } from '@/hooks'
import { updateDocument, COLLECTIONS } from '@/lib/firestore'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  Ruler,
  Banknote,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
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

const phaseLabels: Record<string, string> = {
  sales: '営業',
  design: '設計',
  manufacturing: '製造',
  construction: '施工',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { project, loading, error, update, remove } = useProject(projectId)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleEdit = async (data: Partial<Project>) => {
    setFormLoading(true)
    try {
      await update(data)
      setShowEditForm(false)
    } catch (err) {
      console.error('Failed to update project:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await remove()
      router.push('/sales/projects')
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">案件が見つかりません</h2>
          <button
            onClick={() => router.push('/sales/projects')}
            className="text-primary-600 hover:text-primary-700"
          >
            案件一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title={project.name} subtitle={`案件番号: ${project.projectNumber}`} />

      <div className="p-6">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/sales/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            案件一覧に戻る
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              編集
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              削除
            </button>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム：詳細 */}
          <div className="lg:col-span-2 space-y-6">
            {/* ステータス */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ステータス</h3>
              <div className="flex items-center gap-4">
                <span className={cn('px-3 py-1.5 text-sm font-medium rounded-full', statusColors[project.status])}>
                  {statusLabels[project.status]}
                </span>
                <span className="text-gray-500">
                  フェーズ: <span className="font-medium text-gray-900">{phaseLabels[project.currentPhase]}</span>
                </span>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">案件情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">施工場所</p>
                    <p className="font-medium text-gray-900">{project.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">膜構造タイプ</p>
                    <p className="font-medium text-gray-900">{project.structureType}</p>
                  </div>
                </div>
                {project.estimatedArea && (
                  <div className="flex items-start gap-3">
                    <Ruler className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">想定面積</p>
                      <p className="font-medium text-gray-900">{project.estimatedArea.toLocaleString()} m²</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">問い合わせ日</p>
                    <p className="font-medium text-gray-900">
                      {project.inquiryDate ? formatDate(project.inquiryDate) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {project.description && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">概要</p>
                      <p className="text-gray-900">{project.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム：金額 */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">金額</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">見積金額</p>
                    <p className="text-xl font-bold text-gray-900">
                      {project.estimatedAmount ? formatCurrency(project.estimatedAmount) : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">契約金額</p>
                    <p className="text-xl font-bold text-green-600">
                      {project.contractAmount ? formatCurrency(project.contractAmount) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 日程 */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">日程</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">契約日</p>
                  <p className="font-medium text-gray-900">
                    {project.contractDate ? formatDate(project.contractDate) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">納期</p>
                  <p className="font-medium text-gray-900">
                    {project.deliveryDate ? formatDate(project.deliveryDate) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">完了日</p>
                  <p className="font-medium text-gray-900">
                    {project.completionDate ? formatDate(project.completionDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 編集フォーム */}
      {showEditForm && (
        <ProjectForm
          project={project}
          onSubmit={handleEdit}
          onCancel={() => setShowEditForm(false)}
          isLoading={formLoading}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">案件を削除</h3>
            <p className="text-gray-600 mb-6">
              「{project.name}」を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
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
