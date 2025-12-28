'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types'
import {
  getProjects,
  getProjectStats,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS,
} from '@/lib/firestore'

interface UseProjectsOptions {
  status?: string
  phase?: string
  limitCount?: number
}

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProjects(options?: UseProjectsOptions): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProjects(options)
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
      setProjects([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.status, options?.phase, options?.limitCount])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}

interface ProjectStats {
  total: number
  byStatus: Record<string, number>
  byPhase: Record<string, number>
}

interface UseProjectStatsReturn {
  stats: ProjectStats | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProjectStats(): UseProjectStatsReturn {
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProjectStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

interface UseProjectReturn {
  project: Project | null
  loading: boolean
  error: Error | null
  update: (data: Partial<Project>) => Promise<void>
  remove: () => Promise<void>
}

export function useProject(id: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        setError(null)
        const data = await getDocument<Project>(COLLECTIONS.PROJECTS, id)
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'))
        setProject(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  const update = useCallback(
    async (data: Partial<Project>) => {
      if (!id) return
      await updateDocument(COLLECTIONS.PROJECTS, id, data)
      setProject((prev) => (prev ? { ...prev, ...data } : null))
    },
    [id]
  )

  const remove = useCallback(async () => {
    if (!id) return
    await deleteDocument(COLLECTIONS.PROJECTS, id)
    setProject(null)
  }, [id])

  return { project, loading, error, update, remove }
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  return createDocument(COLLECTIONS.PROJECTS, data)
}
