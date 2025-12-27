import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function generateProjectNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `YS-${year}-${random}`
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    inquiry: '問い合わせ',
    estimating: '見積中',
    negotiating: '商談中',
    contracted: '契約済',
    designing: '設計中',
    manufacturing: '製造中',
    installing: '施工中',
    completed: '完了',
    cancelled: 'キャンセル',
    draft: '下書き',
    submitted: '提出済',
    approved: '承認済',
    rejected: '却下',
    review: 'レビュー中',
    revision: '修正中',
    pending: '未着手',
    in_progress: '進行中',
    delayed: '遅延',
    ordered: '発注済',
    received: '入荷済',
    used: '使用済',
    pass: '合格',
    fail: '不合格',
    conditional: '条件付合格',
    na: '対象外',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    inquiry: 'bg-gray-100 text-gray-800',
    estimating: 'bg-blue-100 text-blue-800',
    negotiating: 'bg-yellow-100 text-yellow-800',
    contracted: 'bg-green-100 text-green-800',
    designing: 'bg-purple-100 text-purple-800',
    manufacturing: 'bg-orange-100 text-orange-800',
    installing: 'bg-cyan-100 text-cyan-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    delayed: 'bg-red-100 text-red-800',
    pass: 'bg-green-100 text-green-800',
    fail: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    sales: '営業',
    design: '設計',
    manufacturing: '製造',
    construction: '施工',
  }
  return labels[phase] || phase
}

export function calculateProgress(
  current: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}
