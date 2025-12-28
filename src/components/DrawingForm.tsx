'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Drawing } from '@/types'

const drawingSchema = z.object({
  drawingNumber: z.string().min(1, '図面番号を入力'),
  name: z.string().min(1, '図面名を入力'),
  type: z.enum(['plan', 'elevation', 'detail', 'structural', 'other']),
  version: z.number().min(1),
  status: z.enum(['draft', 'review', 'approved', 'revision']),
  fileUrl: z.string().optional(),
  createdBy: z.string().min(1, '作成者を入力'),
})

type DrawingFormData = z.infer<typeof drawingSchema>

interface DrawingFormProps {
  projectId: string
  drawing?: Drawing
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const typeOptions = [
  { value: 'plan', label: '平面図' },
  { value: 'elevation', label: '立面図' },
  { value: 'detail', label: '詳細図' },
  { value: 'structural', label: '構造図' },
  { value: 'other', label: 'その他' },
]

const statusOptions = [
  { value: 'draft', label: '下書き' },
  { value: 'review', label: 'レビュー中' },
  { value: 'approved', label: '承認済' },
  { value: 'revision', label: '修正中' },
]

export default function DrawingForm({ projectId, drawing, onSubmit, onCancel, isLoading }: DrawingFormProps) {
  const isEdit = !!drawing

  const { register, handleSubmit, formState: { errors } } = useForm<DrawingFormData>({
    resolver: zodResolver(drawingSchema),
    defaultValues: drawing ? {
      drawingNumber: drawing.drawingNumber,
      name: drawing.name,
      type: drawing.type,
      version: drawing.version,
      status: drawing.status,
      fileUrl: drawing.fileUrl || '',
      createdBy: drawing.createdBy,
    } : {
      drawingNumber: `DWG-${Date.now()}`,
      version: 1,
      type: 'plan',
      status: 'draft',
      createdBy: '',
    },
  })

  const onFormSubmit = async (data: DrawingFormData) => {
    await onSubmit({
      ...data,
      projectId,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '図面を編集' : '図面を登録'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">図面番号</label>
              <input
                {...register('drawingNumber')}
                className={cn('w-full px-3 py-2 border rounded-lg', errors.drawingNumber ? 'border-red-500' : 'border-gray-300')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">バージョン</label>
              <input
                type="number"
                {...register('version', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">図面名</label>
            <input
              {...register('name')}
              className={cn('w-full px-3 py-2 border rounded-lg', errors.name ? 'border-red-500' : 'border-gray-300')}
              placeholder="例: 平面図A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作成者</label>
            <input
              {...register('createdBy')}
              className={cn('w-full px-3 py-2 border rounded-lg', errors.createdBy ? 'border-red-500' : 'border-gray-300')}
              placeholder="例: 田中設計士"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ファイルURL</label>
            <input
              {...register('fileUrl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://..."
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
              {isEdit ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
