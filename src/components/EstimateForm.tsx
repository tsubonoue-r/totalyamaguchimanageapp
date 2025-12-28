'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const estimateItemSchema = z.object({
  description: z.string().min(1, '項目名を入力'),
  quantity: z.number().min(1, '1以上'),
  unit: z.string().min(1, '単位を入力'),
  unitPrice: z.number().min(0, '0以上'),
})

const estimateSchema = z.object({
  estimateNumber: z.string().min(1, '見積番号を入力'),
  items: z.array(estimateItemSchema).min(1, '1つ以上の明細が必要'),
  notes: z.string().optional(),
})

type EstimateFormData = z.infer<typeof estimateSchema>

interface EstimateFormProps {
  projectId: string
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function EstimateForm({ projectId, onSubmit, onCancel, isLoading }: EstimateFormProps) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      estimateNumber: `EST-${Date.now()}`,
      items: [{ description: '', quantity: 1, unit: '式', unitPrice: 0 }],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')

  const subtotal = watchItems?.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0
  const tax = Math.floor(subtotal * 0.1)
  const total = subtotal + tax

  const onFormSubmit = async (data: EstimateFormData) => {
    await onSubmit({
      ...data,
      projectId,
      version: 1,
      subtotal,
      tax,
      total,
      status: 'draft',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">見積書作成</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">見積番号</label>
            <input {...register('estimateNumber')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">明細</label>
              <button type="button" onClick={() => append({ description: '', quantity: 1, unit: '式', unitPrice: 0 })} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> 行追加
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3">項目</th>
                    <th className="text-right py-2 px-3 w-20">数量</th>
                    <th className="text-center py-2 px-3 w-16">単位</th>
                    <th className="text-right py-2 px-3 w-28">単価</th>
                    <th className="text-right py-2 px-3 w-28">金額</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-t">
                      <td className="py-2 px-3">
                        <input {...register(`items.${index}.description`)} className="w-full px-2 py-1 border border-gray-300 rounded" placeholder="項目名" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-full px-2 py-1 border border-gray-300 rounded text-right" />
                      </td>
                      <td className="py-2 px-3">
                        <input {...register(`items.${index}.unit`)} className="w-full px-2 py-1 border border-gray-300 rounded text-center" />
                      </td>
                      <td className="py-2 px-3">
                        <input type="number" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} className="w-full px-2 py-1 border border-gray-300 rounded text-right" />
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatCurrency((watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0))}
                      </td>
                      <td className="py-2 px-3">
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">小計</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">消費税 (10%)</span><span className="font-medium">{formatCurrency(tax)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-bold">合計</span><span className="font-bold text-lg text-primary-600">{formatCurrency(total)}</span></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">キャンセル</button>
            <button type="submit" disabled={isLoading} className={cn('px-4 py-2 text-white rounded-lg flex items-center gap-2', isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700')}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
