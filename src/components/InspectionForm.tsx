'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Inspection } from '@/types'

const checkItemSchema = z.object({
  id: z.string(),
  item: z.string().min(1, '検査項目を入力'),
  standard: z.string().min(1, '基準を入力'),
  result: z.enum(['pass', 'fail', 'na']),
  notes: z.string().optional(),
})

const inspectionSchema = z.object({
  type: z.enum(['material', 'production', 'installation', 'final']),
  date: z.string().min(1, '検査日を入力'),
  inspector: z.string().min(1, '検査員を入力'),
  result: z.enum(['pass', 'fail', 'conditional']),
  checkItems: z.array(checkItemSchema).min(1, '1つ以上の検査項目が必要'),
  notes: z.string().optional(),
})

type InspectionFormData = z.infer<typeof inspectionSchema>

interface InspectionFormProps {
  projectId: string
  inspection?: Inspection
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const typeOptions = [
  { value: 'material', label: '材料検査' },
  { value: 'production', label: '製造検査' },
  { value: 'installation', label: '施工検査' },
  { value: 'final', label: '最終検査' },
]

const resultOptions = [
  { value: 'pass', label: '合格' },
  { value: 'fail', label: '不合格' },
  { value: 'conditional', label: '条件付合格' },
]

const itemResultOptions = [
  { value: 'pass', label: '合格' },
  { value: 'fail', label: '不合格' },
  { value: 'na', label: 'N/A' },
]

export default function InspectionForm({ projectId, inspection, onSubmit, onCancel, isLoading }: InspectionFormProps) {
  const isEdit = !!inspection

  const { register, control, handleSubmit, formState: { errors } } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: inspection ? {
      type: inspection.type,
      date: inspection.date instanceof Date
        ? inspection.date.toISOString().split('T')[0]
        : '',
      inspector: inspection.inspector,
      result: inspection.result,
      checkItems: inspection.checkItems,
      notes: inspection.notes || '',
    } : {
      type: 'installation',
      result: 'pass',
      checkItems: [{
        id: `item-${Date.now()}`,
        item: '',
        standard: '',
        result: 'pass',
      }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'checkItems' })

  const onFormSubmit = async (data: InspectionFormData) => {
    await onSubmit({
      ...data,
      projectId,
      date: new Date(data.date),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '検査記録を編集' : '検査記録を作成'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検査種別</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検査日</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検査員</label>
              <input
                {...register('inspector')}
                className={cn('w-full px-3 py-2 border rounded-lg', errors.inspector ? 'border-red-500' : 'border-gray-300')}
                placeholder="例: 品質管理部 田中"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">総合結果</label>
              <select {...register('result')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {resultOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">検査項目</label>
              <button
                type="button"
                onClick={() => append({
                  id: `item-${Date.now()}`,
                  item: '',
                  standard: '',
                  result: 'pass',
                })}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> 項目追加
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">項目 {index + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      {...register(`checkItems.${index}.item`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="検査項目"
                    />
                    <input
                      {...register(`checkItems.${index}.standard`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="基準"
                    />
                    <select
                      {...register(`checkItems.${index}.result`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {itemResultOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
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
              {isEdit ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
