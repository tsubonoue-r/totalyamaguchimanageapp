'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductionProcess } from '@/types'

const processSchema = z.object({
  name: z.string().min(1, '工程名を入力'),
  sequence: z.number().min(1),
  plannedStartDate: z.string().min(1, '開始日を入力'),
  plannedEndDate: z.string().min(1, '終了日を入力'),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']),
  progress: z.number().min(0).max(100),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

type ProcessFormData = z.infer<typeof processSchema>

interface ProductionProcessFormProps {
  projectId: string
  process?: ProductionProcess
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'delayed', label: '遅延' },
]

export default function ProductionProcessForm({ projectId, process, onSubmit, onCancel, isLoading }: ProductionProcessFormProps) {
  const isEdit = !!process

  const { register, handleSubmit, formState: { errors } } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: process ? {
      name: process.name,
      sequence: process.sequence,
      plannedStartDate: process.plannedStartDate instanceof Date
        ? process.plannedStartDate.toISOString().split('T')[0]
        : '',
      plannedEndDate: process.plannedEndDate instanceof Date
        ? process.plannedEndDate.toISOString().split('T')[0]
        : '',
      status: process.status,
      progress: process.progress,
      assignedTo: process.assignedTo || '',
      notes: process.notes || '',
    } : {
      sequence: 1,
      status: 'pending',
      progress: 0,
    },
  })

  const onFormSubmit = async (data: ProcessFormData) => {
    await onSubmit({
      ...data,
      projectId,
      plannedStartDate: new Date(data.plannedStartDate),
      plannedEndDate: new Date(data.plannedEndDate),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '工程を編集' : '工程を追加'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工程名</label>
              <input
                {...register('name')}
                className={cn('w-full px-3 py-2 border rounded-lg', errors.name ? 'border-red-500' : 'border-gray-300')}
                placeholder="例: 裁断"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">順序</label>
              <input
                type="number"
                {...register('sequence', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予定開始日</label>
              <input
                type="date"
                {...register('plannedStartDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">予定終了日</label>
              <input
                type="date"
                {...register('plannedEndDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">進捗 (%)</label>
              <input
                type="number"
                {...register('progress', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <input
              {...register('assignedTo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="例: 製造チームA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn('px-4 py-2 text-white rounded-lg flex items-center gap-2', isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700')}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
