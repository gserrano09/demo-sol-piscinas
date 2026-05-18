import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp,
  addDoc, QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser, Company, Product, Resource, ResourceType, UserRole } from './types'

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } as AppUser : null
}

export async function getUsers(companyId?: string): Promise<AppUser[]> {
  const constraints: QueryConstraint[] = [orderBy('name')]
  if (companyId) constraints.unshift(where('companyId', '==', companyId))
  const snap = await getDocs(query(collection(db, 'users'), ...constraints))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as AppUser)
}

export async function createUser(uid: string, data: Omit<AppUser, 'uid' | 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    active:    true,
    createdAt: serverTimestamp(),
  })
}

export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function deleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid))
}

// ─────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────
export async function getCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, 'companies', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Company : null
}

export async function getCompanies(): Promise<Company[]> {
  const snap = await getDocs(query(collection(db, 'companies'), orderBy('name')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Company)
}

export async function createCompany(data: Omit<Company, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'companies'), {
    ...data,
    active:    true,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<void> {
  await updateDoc(doc(db, 'companies', id), data)
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } as Product : null
}

export async function getProducts(companyId?: string): Promise<Product[]> {
  const constraints: QueryConstraint[] = [orderBy('name')]
  if (companyId) constraints.unshift(where('companyId', '==', companyId))
  const snap = await getDocs(query(collection(db, 'products'), where('active', '==', true), ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    active:    true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id: string): Promise<void> {
  await updateDoc(doc(db, 'products', id), { active: false })
}

// ─────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────
export async function getResources(productId: string, type?: ResourceType): Promise<Resource[]> {
  const constraints: QueryConstraint[] = [
    where('productId', '==', productId),
    orderBy('createdAt', 'desc'),
  ]
  if (type) constraints.unshift(where('type', '==', type))
  const snap = await getDocs(query(collection(db, 'resources'), ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Resource)
}

export async function getResourcesByCompany(companyId: string): Promise<Resource[]> {
  const snap = await getDocs(query(
    collection(db, 'resources'),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Resource)
}

export async function createResource(data: Omit<Resource, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'resources'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteResource(id: string): Promise<void> {
  await deleteDoc(doc(db, 'resources', id))
}
