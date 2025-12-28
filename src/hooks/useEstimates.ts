'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS,
} from '@/lib/firestore'
import type { Estimate } from '@/types'

export function useEstimates(projectId?: string) {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEstimates = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<Estimate>(COLLECTIONS.ESTIMATES)
      const filtered = projectId
        ? data.filter(e => e.projectId === projectId)
        : data
      setEstimates(filtered)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch estimates'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchEstimates()
  }, [fetchEstimates])

  return { estimates, loading, error, refetch: fetchEstimates }
}

export function useEstimate(id: string) {
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEstimate = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getDocument<Estimate>(COLLECTIONS.ESTIMATES, id)
      setEstimate(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch estimate'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEstimate()
  }, [fetchEstimate])

  const update = async (data: Partial<Estimate>) => {
    await updateDocument(COLLECTIONS.ESTIMATES, id, data)
    await fetchEstimate()
  }

  const remove = async () => {
    await deleteDocument(COLLECTIONS.ESTIMATES, id)
  }

  return { estimate, loading, error, update, remove, refetch: fetchEstimate }
}

export async function createEstimate(data: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.ESTIMATES, data as Record<string, unknown>)
}
