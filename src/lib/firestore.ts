import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project, Customer, Estimate, User } from '@/types'

// Collection names
export const COLLECTIONS = {
  PROJECTS: 'projects',
  CUSTOMERS: 'customers',
  ESTIMATES: 'estimates',
  USERS: 'users',
  DRAWINGS: 'drawings',
  PRODUCTION_PROCESSES: 'productionProcesses',
  MATERIALS: 'materials',
  CONSTRUCTION_SCHEDULES: 'constructionSchedules',
  INSPECTIONS: 'inspections',
} as const

// Date conversion helpers
const toDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
  if (!timestamp) return undefined
  if (timestamp instanceof Timestamp) return timestamp.toDate()
  return timestamp
}

const toTimestamp = (date: Date | undefined): Timestamp | undefined => {
  if (!date) return undefined
  return Timestamp.fromDate(date)
}

// Generic CRUD operations
export async function getDocuments<T>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...queryConstraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[]
}

export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as T
}

export async function createDocument(
  collectionName: string,
  data: Record<string, unknown>
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

// Project specific operations
export async function getProjects(options?: {
  status?: string
  phase?: string
  limitCount?: number
}): Promise<Project[]> {
  const constraints: QueryConstraint[] = []

  if (options?.status) {
    constraints.push(where('status', '==', options.status))
  }
  if (options?.phase) {
    constraints.push(where('currentPhase', '==', options.phase))
  }
  constraints.push(orderBy('updatedAt', 'desc'))
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount))
  }

  return getDocuments<Project>(COLLECTIONS.PROJECTS, ...constraints)
}

export async function getProjectStats(): Promise<{
  total: number
  byStatus: Record<string, number>
  byPhase: Record<string, number>
}> {
  const projects = await getDocuments<Project>(COLLECTIONS.PROJECTS)

  const byStatus: Record<string, number> = {}
  const byPhase: Record<string, number> = {}

  projects.forEach((project) => {
    byStatus[project.status] = (byStatus[project.status] || 0) + 1
    byPhase[project.currentPhase] = (byPhase[project.currentPhase] || 0) + 1
  })

  return {
    total: projects.length,
    byStatus,
    byPhase,
  }
}

// Customer operations
export async function getCustomers(): Promise<Customer[]> {
  return getDocuments<Customer>(
    COLLECTIONS.CUSTOMERS,
    orderBy('companyName', 'asc')
  )
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return getDocument<Customer>(COLLECTIONS.CUSTOMERS, id)
}

// User operations
export async function getUsers(): Promise<User[]> {
  return getDocuments<User>(COLLECTIONS.USERS, orderBy('name', 'asc'))
}

export async function getUserById(id: string): Promise<User | null> {
  return getDocument<User>(COLLECTIONS.USERS, id)
}

// Estimate operations
export async function getEstimatesByProject(projectId: string): Promise<Estimate[]> {
  return getDocuments<Estimate>(
    COLLECTIONS.ESTIMATES,
    where('projectId', '==', projectId),
    orderBy('version', 'desc')
  )
}
