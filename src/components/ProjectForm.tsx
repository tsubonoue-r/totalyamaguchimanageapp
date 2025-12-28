'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { cn, generateProjectNumber } from '@/lib/utils'
import type { Project, ProjectStatus, ProjectPhase } from '@/types'

const projectSchema = z.object({
  name: z.string().min(1, '案件名を入力してください'),
  customerId: z.string().optional(),
  status: z.enum(['inquiry', 'estimating', 'negotiating', 'contracted', 'designing', 'manufacturing', 'installing', 'completed', 'cancelled']),
  currentPhase: z.enum(['sales', 'design', 'manufacturing', 'construction']),
  description: z.string().optional(),
  location: z.string().min(1, '施工場所を入力してください'),
  structureType: z.string().min(1, '膜構造タイプを入力してください'),
  estimatedArea: z.number().optional(),
  estimatedAmount: z.number().optional(),
  contractAmount: z.number().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: Record<string, unknown> & { projectNumber: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'inquiry', label: '問い合わせ' },
  { value: 'estimating', label: '見積中' },
  { value: 'negotiating', label: '商談中' },
  { value: 'contracted', label: '契約済' },
  { value: 'designing', label: '設計中' },
  { value: 'manufacturing', label: '製造中' },
  { value: 'installing', label: '施工中' },
  { value: 'completed', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' },
]

const phaseOptions: { value: ProjectPhase; label: string }[] = [
  { value: 'sales', label: '営業' },
  { value: 'design', label: '設計' },
  { value: 'manufacturing', label: '製造' },
  { value: 'construction', label: '施工' },
]

const structureTypes = [
  'テント膜構造',
  'サスペンション膜構造',
  '空気膜構造',
  'ハイブリッド膜構造',
  'その他',
]

export default function ProjectForm({ project, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const isEdit = !!project

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      customerId: project.customerId,
      status: project.status,
      currentPhase: project.currentPhase,
      description: project.description || '',
      location: project.location,
      structureType: project.structureType,
      estimatedArea: project.estimatedArea,
      estimatedAmount: project.estimatedAmount,
      contractAmount: project.contractAmount,
    } : {
      status: 'inquiry',
      currentPhase: 'sales',
    },
  })

  const onFormSubmit = async (data: ProjectFormData) => {
    const projectNumber = project?.projectNumber || generateProjectNumber()
    await onSubmit({ ...data, projectNumber })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '案件を編集' : '新規案件作成'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          {/* 案件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              案件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                errors.name ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="例: ○○スタジアム膜屋根"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* ステータス・フェーズ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フェーズ <span className="text-red-500">*</span>
              </label>
              <select
                {...register('currentPhase')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {phaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 施工場所・膜構造タイプ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                施工場所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('location')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                  errors.location ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="例: 山口県山口市"
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                膜構造タイプ <span className="text-red-500">*</span>
              </label>
              <select
                {...register('structureType')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                  errors.structureType ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">選択してください</option>
                {structureTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.structureType && <p className="mt-1 text-sm text-red-500">{errors.structureType.message}</p>}
            </div>
          </div>

          {/* 想定面積 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              想定面積 (m²)
            </label>
            <input
              type="number"
              {...register('estimatedArea', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="例: 500"
            />
          </div>

          {/* 金額 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                見積金額 (円)
              </label>
              <input
                type="number"
                {...register('estimatedAmount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="例: 10000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                契約金額 (円)
              </label>
              <input
                type="number"
                {...register('contractAmount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="例: 9500000"
              />
            </div>
          </div>

          {/* 概要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              概要
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="案件の概要を入力..."
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors',
                isLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
