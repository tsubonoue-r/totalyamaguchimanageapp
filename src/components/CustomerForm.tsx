'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types'

const customerSchema = z.object({
  companyName: z.string().min(1, '会社名を入力してください'),
  contactName: z.string().min(1, '担当者名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function CustomerForm({ customer, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const isEdit = !!customer

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      companyName: customer.companyName,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes || '',
    } : {},
  })

  const onFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '顧客を編集' : '新規顧客登録'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('companyName')}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none',
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="例: 株式会社ABC建設"
            />
            {errors.companyName && <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当者名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('contactName')}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none',
                errors.contactName ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="例: 山田 太郎"
            />
            {errors.contactName && <p className="mt-1 text-sm text-red-500">{errors.contactName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none',
                  errors.email ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="example@company.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none',
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="03-1234-5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              住所 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('address')}
              className={cn(
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none',
                errors.address ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="例: 東京都千代田区..."
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="メモや備考..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-white rounded-lg flex items-center gap-2',
                isLoading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              )}
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
