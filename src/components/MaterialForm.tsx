'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Material } from '@/types'

const materialSchema = z.object({
  name: z.string().min(1, '材料名を入力'),
  specification: z.string().min(1, '仕様を入力'),
  quantity: z.number().min(0.01, '数量を入力'),
  unit: z.string().min(1, '単位を入力'),
  status: z.enum(['pending', 'ordered', 'received', 'used']),
  supplier: z.string().optional(),
  cost: z.number().optional(),
  expectedDate: z.string().optional(),
})

type MaterialFormData = z.infer<typeof materialSchema>

interface MaterialFormProps {
  projectId: string
  material?: Material
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions = [
  { value: 'pending', label: '未発注' },
  { value: 'ordered', label: '発注済' },
  { value: 'received', label: '入荷済' },
  { value: 'used', label: '使用済' },
]

export default function MaterialForm({ projectId, material, onSubmit, onCancel, isLoading }: MaterialFormProps) {
  const isEdit = !!material

  const { register, handleSubmit, formState: { errors } } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: material ? {
      name: material.name,
      specification: material.specification,
      quantity: material.quantity,
      unit: material.unit,
      status: material.status,
      supplier: material.supplier || '',
      cost: material.cost,
      expectedDate: material.expectedDate instanceof Date
        ? material.expectedDate.toISOString().split('T')[0]
        : '',
    } : {
      status: 'pending',
      unit: 'm²',
    },
  })

  const onFormSubmit = async (data: MaterialFormData) => {
    await onSubmit({
      ...data,
      projectId,
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '材料を編集' : '材料を追加'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">材料名</label>
            <input
              {...register('name')}
              className={cn('w-full px-3 py-2 border rounded-lg', errors.name ? 'border-red-500' : 'border-gray-300')}
              placeholder="例: PTFE膜材"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仕様</label>
            <input
              {...register('specification')}
              className={cn('w-full px-3 py-2 border rounded-lg', errors.specification ? 'border-red-500' : 'border-gray-300')}
              placeholder="例: 白色 1.0mm厚"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
              <input
                type="number"
                step="0.01"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
              <input
                {...register('unit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="m², m, 本"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">入荷予定日</label>
              <input
                type="date"
                {...register('expectedDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">仕入先</label>
              <input
                {...register('supplier')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="例: ○○商事"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">単価</label>
              <input
                type="number"
                {...register('cost', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
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
