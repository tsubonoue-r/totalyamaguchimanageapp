'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConstructionSchedule } from '@/types'

const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '作業名を入力'),
  sequence: z.number().min(1),
  plannedStartDate: z.string().min(1),
  plannedEndDate: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']),
  assignedTeam: z.string().optional(),
  notes: z.string().optional(),
})

const scheduleSchema = z.object({
  plannedStartDate: z.string().min(1, '開始日を入力'),
  plannedEndDate: z.string().min(1, '終了日を入力'),
  status: z.enum(['pending', 'in_progress', 'completed', 'delayed']),
  tasks: z.array(taskSchema).min(1, '1つ以上のタスクが必要'),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

interface ConstructionScheduleFormProps {
  projectId: string
  schedule?: ConstructionSchedule
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const statusOptions = [
  { value: 'pending', label: '予定' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'delayed', label: '遅延' },
]

const taskStatusOptions = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
]

export default function ConstructionScheduleForm({ projectId, schedule, onSubmit, onCancel, isLoading }: ConstructionScheduleFormProps) {
  const isEdit = !!schedule

  const { register, control, handleSubmit, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: schedule ? {
      plannedStartDate: schedule.plannedStartDate instanceof Date
        ? schedule.plannedStartDate.toISOString().split('T')[0]
        : '',
      plannedEndDate: schedule.plannedEndDate instanceof Date
        ? schedule.plannedEndDate.toISOString().split('T')[0]
        : '',
      status: schedule.status,
      tasks: schedule.tasks.map(t => ({
        ...t,
        plannedStartDate: t.plannedStartDate instanceof Date
          ? t.plannedStartDate.toISOString().split('T')[0]
          : '',
        plannedEndDate: t.plannedEndDate instanceof Date
          ? t.plannedEndDate.toISOString().split('T')[0]
          : '',
      })),
    } : {
      status: 'pending',
      tasks: [{
        id: `task-${Date.now()}`,
        name: '',
        sequence: 1,
        plannedStartDate: '',
        plannedEndDate: '',
        status: 'pending',
      }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' })

  const onFormSubmit = async (data: ScheduleFormData) => {
    await onSubmit({
      ...data,
      projectId,
      plannedStartDate: new Date(data.plannedStartDate),
      plannedEndDate: new Date(data.plannedEndDate),
      tasks: data.tasks.map(t => ({
        ...t,
        plannedStartDate: new Date(t.plannedStartDate),
        plannedEndDate: new Date(t.plannedEndDate),
      })),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '施工スケジュールを編集' : '施工スケジュールを作成'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">作業タスク</label>
              <button
                type="button"
                onClick={() => append({
                  id: `task-${Date.now()}`,
                  name: '',
                  sequence: fields.length + 1,
                  plannedStartDate: '',
                  plannedEndDate: '',
                  status: 'pending',
                })}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> タスク追加
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">タスク {index + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        {...register(`tasks.${index}.name`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="作業名"
                      />
                    </div>
                    <div>
                      <select
                        {...register(`tasks.${index}.status`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {taskStatusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      {...register(`tasks.${index}.plannedStartDate`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      {...register(`tasks.${index}.plannedEndDate`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <input
                    {...register(`tasks.${index}.assignedTeam`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="担当チーム"
                  />
                </div>
              ))}
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
              {isEdit ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
