'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CustomerForm from '@/components/CustomerForm'
import { useCustomers, createCustomer } from '@/hooks'
import { updateDocument, deleteDocument, COLLECTIONS } from '@/lib/firestore'
import { Plus, Search, Loader2, MoreVertical, Edit, Trash2, Eye, Building2, Mail, Phone } from 'lucide-react'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const router = useRouter()
  const { customers, loading, refetch } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [customers, searchQuery])

  const handleCreate = async (data: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      await createCustomer(data as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Failed to create customer:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editingCustomer) return
    setFormLoading(true)
    try {
      await updateDocument(COLLECTIONS.CUSTOMERS, editingCustomer.id, data)
      setEditingCustomer(null)
      refetch()
    } catch (error) {
      console.error('Failed to update customer:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(COLLECTIONS.CUSTOMERS, id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="顧客管理" subtitle="顧客情報の登録・管理" />

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="会社名または担当者名で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規登録
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            {searchQuery ? '該当する顧客がありません' : '顧客が登録されていません'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{customer.companyName}</h3>
                      <p className="text-sm text-gray-500">{customer.contactName}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {activeMenu === customer.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => { setEditingCustomer(customer); setActiveMenu(null) }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> 編集
                        </button>
                        <button
                          onClick={() => { setDeleteConfirm(customer.id); setActiveMenu(null) }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> 削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">{filteredCustomers.length} 件の顧客</div>
      </div>

      {showForm && <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} isLoading={formLoading} />}
      {editingCustomer && <CustomerForm customer={editingCustomer} onSubmit={handleEdit} onCancel={() => setEditingCustomer(null)} isLoading={formLoading} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">顧客を削除</h3>
            <p className="text-gray-600 mb-6">この顧客を削除してもよろしいですか？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">キャンセル</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg">削除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
