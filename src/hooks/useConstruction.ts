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
import type { ConstructionSchedule, Inspection } from '@/types'

// Construction Schedule hooks
export function useConstructionSchedules(projectId?: string) {
  const [schedules, setSchedules] = useState<ConstructionSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<ConstructionSchedule>(COLLECTIONS.CONSTRUCTION_SCHEDULES)
      const filtered = projectId
        ? data.filter(s => s.projectId === projectId)
        : data
      setSchedules(filtered)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch schedules'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return { schedules, loading, error, refetch: fetchSchedules }
}

export function useConstructionSchedule(id: string) {
  const [schedule, setSchedule] = useState<ConstructionSchedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSchedule = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getDocument<ConstructionSchedule>(COLLECTIONS.CONSTRUCTION_SCHEDULES, id)
      setSchedule(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch schedule'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const update = async (data: Partial<ConstructionSchedule>) => {
    await updateDocument(COLLECTIONS.CONSTRUCTION_SCHEDULES, id, data)
    await fetchSchedule()
  }

  const remove = async () => {
    await deleteDocument(COLLECTIONS.CONSTRUCTION_SCHEDULES, id)
  }

  return { schedule, loading, error, update, remove, refetch: fetchSchedule }
}

export async function createConstructionSchedule(data: Omit<ConstructionSchedule, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.CONSTRUCTION_SCHEDULES, data as Record<string, unknown>)
}

// Inspection hooks
export function useInspections(projectId?: string) {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInspections = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<Inspection>(COLLECTIONS.INSPECTIONS)
      const filtered = projectId
        ? data.filter(i => i.projectId === projectId)
        : data
      setInspections(filtered)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch inspections'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchInspections()
  }, [fetchInspections])

  return { inspections, loading, error, refetch: fetchInspections }
}

export async function createInspection(data: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.INSPECTIONS, data as Record<string, unknown>)
}

export function useConstructionStats() {
  const { schedules, loading: scheduleLoading } = useConstructionSchedules()
  const { inspections, loading: inspectionLoading } = useInspections()

  const stats = {
    totalSchedules: schedules.length,
    pending: schedules.filter(s => s.status === 'pending').length,
    inProgress: schedules.filter(s => s.status === 'in_progress').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    delayed: schedules.filter(s => s.status === 'delayed').length,
    totalInspections: inspections.length,
    passed: inspections.filter(i => i.result === 'pass').length,
    failed: inspections.filter(i => i.result === 'fail').length,
    conditional: inspections.filter(i => i.result === 'conditional').length,
  }

  return { stats, loading: scheduleLoading || inspectionLoading }
}
