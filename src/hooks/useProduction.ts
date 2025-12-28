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
import type { ProductionProcess, Material } from '@/types'

// Production Process hooks
export function useProductionProcesses(projectId?: string) {
  const [processes, setProcesses] = useState<ProductionProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProcesses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<ProductionProcess>(COLLECTIONS.PRODUCTION_PROCESSES)
      const filtered = projectId
        ? data.filter(p => p.projectId === projectId)
        : data
      setProcesses(filtered.sort((a, b) => a.sequence - b.sequence))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch processes'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  return { processes, loading, error, refetch: fetchProcesses }
}

export function useProductionProcess(id: string) {
  const [process, setProcess] = useState<ProductionProcess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProcess = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getDocument<ProductionProcess>(COLLECTIONS.PRODUCTION_PROCESSES, id)
      setProcess(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch process'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProcess()
  }, [fetchProcess])

  const update = async (data: Partial<ProductionProcess>) => {
    await updateDocument(COLLECTIONS.PRODUCTION_PROCESSES, id, data)
    await fetchProcess()
  }

  const remove = async () => {
    await deleteDocument(COLLECTIONS.PRODUCTION_PROCESSES, id)
  }

  return { process, loading, error, update, remove, refetch: fetchProcess }
}

export async function createProductionProcess(data: Omit<ProductionProcess, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.PRODUCTION_PROCESSES, data as Record<string, unknown>)
}

// Material hooks
export function useMaterials(projectId?: string) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<Material>(COLLECTIONS.MATERIALS)
      const filtered = projectId
        ? data.filter(m => m.projectId === projectId)
        : data
      setMaterials(filtered)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch materials'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  return { materials, loading, error, refetch: fetchMaterials }
}

export async function createMaterial(data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.MATERIALS, data as Record<string, unknown>)
}

export function useProductionStats() {
  const { processes, loading: processLoading } = useProductionProcesses()
  const { materials, loading: materialLoading } = useMaterials()

  const stats = {
    totalProcesses: processes.length,
    pending: processes.filter(p => p.status === 'pending').length,
    inProgress: processes.filter(p => p.status === 'in_progress').length,
    completed: processes.filter(p => p.status === 'completed').length,
    delayed: processes.filter(p => p.status === 'delayed').length,
    avgProgress: processes.length > 0
      ? Math.round(processes.reduce((sum, p) => sum + p.progress, 0) / processes.length)
      : 0,
    totalMaterials: materials.length,
    pendingMaterials: materials.filter(m => m.status === 'pending').length,
    orderedMaterials: materials.filter(m => m.status === 'ordered').length,
    receivedMaterials: materials.filter(m => m.status === 'received').length,
  }

  return { stats, loading: processLoading || materialLoading }
}
