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
import type { Drawing } from '@/types'

export function useDrawings(projectId?: string) {
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDrawings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDocuments<Drawing>(COLLECTIONS.DRAWINGS)
      const filtered = projectId
        ? data.filter(d => d.projectId === projectId)
        : data
      setDrawings(filtered)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch drawings'))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDrawings()
  }, [fetchDrawings])

  return { drawings, loading, error, refetch: fetchDrawings }
}

export function useDrawing(id: string) {
  const [drawing, setDrawing] = useState<Drawing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDrawing = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getDocument<Drawing>(COLLECTIONS.DRAWINGS, id)
      setDrawing(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch drawing'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDrawing()
  }, [fetchDrawing])

  const update = async (data: Partial<Drawing>) => {
    await updateDocument(COLLECTIONS.DRAWINGS, id, data)
    await fetchDrawing()
  }

  const remove = async () => {
    await deleteDocument(COLLECTIONS.DRAWINGS, id)
  }

  return { drawing, loading, error, update, remove, refetch: fetchDrawing }
}

export async function createDrawing(data: Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'>) {
  return createDocument(COLLECTIONS.DRAWINGS, data as Record<string, unknown>)
}

export function useDrawingStats() {
  const { drawings, loading } = useDrawings()

  const stats = {
    total: drawings.length,
    draft: drawings.filter(d => d.status === 'draft').length,
    review: drawings.filter(d => d.status === 'review').length,
    approved: drawings.filter(d => d.status === 'approved').length,
    revision: drawings.filter(d => d.status === 'revision').length,
  }

  return { stats, loading }
}
