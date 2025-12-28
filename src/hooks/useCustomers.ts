'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Customer } from '@/types'
import {
  getCustomers,
  getCustomerById,
  createDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS,
} from '@/lib/firestore'

interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'))
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return { customers, loading, error, refetch: fetchCustomers }
}

interface UseCustomerReturn {
  customer: Customer | null
  loading: boolean
  error: Error | null
  update: (data: Partial<Customer>) => Promise<void>
  remove: () => Promise<void>
}

export function useCustomer(id: string): UseCustomerReturn {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setLoading(true)
        setError(null)
        const data = await getCustomerById(id)
        setCustomer(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customer'))
        setCustomer(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCustomer()
    }
  }, [id])

  const update = useCallback(
    async (data: Partial<Customer>) => {
      if (!id) return
      await updateDocument(COLLECTIONS.CUSTOMERS, id, data)
      setCustomer((prev) => (prev ? { ...prev, ...data } : null))
    },
    [id]
  )

  const remove = useCallback(async () => {
    if (!id) return
    await deleteDocument(COLLECTIONS.CUSTOMERS, id)
    setCustomer(null)
  }, [id])

  return { customer, loading, error, update, remove }
}

export async function createCustomer(
  data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return createDocument(COLLECTIONS.CUSTOMERS, data)
}
