'use server'

import { headers } from 'next/headers'
import { adminAuth, adminDb } from './firebase-admin'
import type {
  AppUser,
  UserRole,
  Product,
  Company,
  Resource,
  ResourceType,
  AuditLog,
} from '@/types'
import { ROLE_PERMISSIONS } from '@/types'

// ─────────────────────────────────────────────────────────────────
// Helper: Verify auth token and get user
// ─────────────────────────────────────────────────────────────────

async function verifyAndGetUser(token?: string) {
  const headersList = await headers()
  const authToken = token || headersList.get('authorization')?.replace('Bearer ', '')

  if (!authToken) {
    throw new Error('Não autorizado: token em falta')
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken)
    const uid = decodedToken.uid
    const userDoc = await adminDb.collection('users').doc(uid).get()

    if (!userDoc.exists) {
      throw new Error('Utilizador não encontrado')
    }

    const appUser = userDoc.data() as AppUser
    return { uid, appUser }
  } catch (e: any) {
    throw new Error(`Autenticação falhou: ${e.message}`)
  }
}

// ─────────────────────────────────────────────────────────────────
// Helper: Log audit event
// ─────────────────────────────────────────────────────────────────

async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  companyId: string,
  details?: {
    before?: any
    after?: any
    resourceId?: string
  }
) {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  const auditLog: AuditLog = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    resource,
    companyId,
    before: details?.before,
    after: details?.after,
    resourceId: details?.resourceId,
    timestamp: new Date(),
    ipAddress: clientIp,
    userAgent,
  }

  await adminDb.collection('audit_logs').doc(auditLog.id).set(auditLog)
}

// ─────────────────────────────────────────────────────────────────
// USER ACTIONS
// ─────────────────────────────────────────────────────────────────

export async function createUserAction(
  email: string,
  password: string,
  userData: Partial<AppUser>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem criar utilizadores')
    }

    if (!email?.trim() || !password?.trim()) {
      throw new Error('Email e password são obrigatórios')
    }

    if (password.length < 6) {
      throw new Error('Password deve ter pelo menos 6 caracteres')
    }

    if (!userData.name?.trim()) {
      throw new Error('Nome é obrigatório')
    }

    if (!userData.role || !ROLE_PERMISSIONS[userData.role]) {
      throw new Error('Role inválido')
    }

    if (!userData.companyId?.trim()) {
      throw new Error('Company ID é obrigatório')
    }

    // Verify company exists
    const companyDoc = await adminDb.collection('companies').doc(userData.companyId).get()
    if (!companyDoc.exists) {
      throw new Error('Empresa não encontrada')
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: email.trim(),
      password: password.trim(),
    })

    // Create Firestore user document
    const newUser: AppUser = {
      uid: userRecord.uid,
      name: userData.name.trim(),
      email: email.trim(),
      role: userData.role,
      companyId: userData.companyId,
      active: true,
      createdAt: new Date(),
    }

    await adminDb.collection('users').doc(userRecord.uid).set(newUser)

    await logAuditEvent(currentUid, 'CREATE_USER', 'users', currentUser.companyId, {
      after: newUser,
      resourceId: userRecord.uid,
    })

    return {
      success: true,
      data: newUser,
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function updateUserAction(
  userId: string,
  updates: Partial<AppUser>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar utilizadores')
    }

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('Utilizador não encontrado')
    }

    const existingUser = userDoc.data() as AppUser

    if (updates.role && !ROLE_PERMISSIONS[updates.role]) {
      throw new Error('Role inválido')
    }

    if (updates.companyId) {
      const companyDoc = await adminDb.collection('companies').doc(updates.companyId).get()
      if (!companyDoc.exists) {
        throw new Error('Empresa não encontrada')
      }
    }

    const updateData = {
      ...updates,
      name: updates.name?.trim(),
    }

    await adminDb.collection('users').doc(userId).update(updateData)

    await logAuditEvent(currentUid, 'UPDATE_USER', 'users', currentUser.companyId, {
      before: existingUser,
      after: { ...existingUser, ...updateData },
      resourceId: userId,
    })

    return {
      success: true,
      data: { ...existingUser, ...updateData },
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function deleteUserAction(userId: string, token?: string) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem eliminar utilizadores')
    }

    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new Error('Utilizador não encontrado')
    }

    const deletedUser = userDoc.data() as AppUser

    await adminAuth.deleteUser(userId)
    await adminDb.collection('users').doc(userId).delete()

    await logAuditEvent(currentUid, 'DELETE_USER', 'users', currentUser.companyId, {
      before: deletedUser,
      resourceId: userId,
    })

    return { success: true }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT ACTIONS
// ─────────────────────────────────────────────────────────────────

export async function createProductAction(
  productData: Partial<Product>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem criar produtos')
    }

    if (!productData.name?.trim() || !productData.companyId?.trim()) {
      throw new Error('Nome e Empresa são obrigatórios')
    }

    const companyDoc = await adminDb.collection('companies').doc(productData.companyId).get()
    if (!companyDoc.exists) {
      throw new Error('Empresa não encontrada')
    }

    const productId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newProduct: Product = {
      id: productId,
      name: productData.name.trim(),
      description: productData.description?.trim() || '',
      companyId: productData.companyId,
      imageUrl: productData.imageUrl,
      tags: productData.tags || [],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await adminDb.collection('products').doc(productId).set(newProduct)

    await logAuditEvent(currentUid, 'CREATE_PRODUCT', 'products', currentUser.companyId, {
      after: newProduct,
      resourceId: productId,
    })

    return {
      success: true,
      data: newProduct,
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function updateProductAction(
  productId: string,
  updates: Partial<Product>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar produtos')
    }

    const productDoc = await adminDb.collection('products').doc(productId).get()
    if (!productDoc.exists) {
      throw new Error('Produto não encontrado')
    }

    const existingProduct = productDoc.data() as Product

    const updated = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      updatedAt: new Date(),
    }

    await adminDb.collection('products').doc(productId).update(updated)

    await logAuditEvent(currentUid, 'UPDATE_PRODUCT', 'products', currentUser.companyId, {
      before: existingProduct,
      after: { ...existingProduct, ...updated },
      resourceId: productId,
    })

    return {
      success: true,
      data: { ...existingProduct, ...updated },
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function deleteProductAction(productId: string, token?: string) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem eliminar produtos')
    }

    const productDoc = await adminDb.collection('products').doc(productId).get()
    if (!productDoc.exists) {
      throw new Error('Produto não encontrado')
    }

    const deletedProduct = productDoc.data() as Product

    await adminDb.collection('products').doc(productId).delete()

    await logAuditEvent(currentUid, 'DELETE_PRODUCT', 'products', currentUser.companyId, {
      before: deletedProduct,
      resourceId: productId,
    })

    return { success: true }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// RESOURCE ACTIONS
// ─────────────────────────────────────────────────────────────────

export async function createResourceAction(
  resourceData: Partial<Resource> & { type: ResourceType; productId: string; companyId: string; url: string },
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    const allowedTypes = ROLE_PERMISSIONS[currentUser.role]
    if (!allowedTypes.includes(resourceData.type)) {
      throw new Error(`Não tem permissão para fazer upload de "${resourceData.type}"`)
    }

    if (currentUser.role !== 'admin' && resourceData.companyId !== currentUser.companyId) {
      throw new Error('Não pode fazer upload para uma empresa que não é a sua')
    }

    if (!resourceData.name?.trim() || !resourceData.url?.trim()) {
      throw new Error('Nome e URL são obrigatórios')
    }

    const resourceId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newResource: Resource = {
      id: resourceId,
      name: resourceData.name.trim(),
      type: resourceData.type,
      url: resourceData.url,
      storagePath: resourceData.storagePath || '',
      productId: resourceData.productId,
      companyId: resourceData.companyId,
      mimeType: resourceData.mimeType || 'application/octet-stream',
      size: resourceData.size || 0,
      uploadedBy: currentUid,
      createdAt: new Date(),
    }

    await adminDb.collection('resources').doc(resourceId).set(newResource)

    await logAuditEvent(currentUid, 'CREATE_RESOURCE', 'resources', currentUser.companyId, {
      after: newResource,
      resourceId: resourceId,
    })

    return {
      success: true,
      data: newResource,
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function deleteResourceAction(resourceId: string, token?: string) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem eliminar recursos')
    }

    const resourceDoc = await adminDb.collection('resources').doc(resourceId).get()
    if (!resourceDoc.exists) {
      throw new Error('Recurso não encontrado')
    }

    const deletedResource = resourceDoc.data() as Resource

    await adminDb.collection('resources').doc(resourceId).delete()

    await logAuditEvent(currentUid, 'DELETE_RESOURCE', 'resources', currentUser.companyId, {
      before: deletedResource,
      resourceId: resourceId,
    })

    return { success: true }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// COMPANY ACTIONS
// ─────────────────────────────────────────────────────────────────

export async function createCompanyAction(
  companyData: Partial<Company>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem criar empresas')
    }

    if (!companyData.name?.trim()) {
      throw new Error('Nome da empresa é obrigatório')
    }

    const companyId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newCompany: Company = {
      id: companyId,
      name: companyData.name.trim(),
      country: companyData.country?.trim() || '',
      logoUrl: companyData.logoUrl,
      active: true,
      createdAt: new Date(),
    }

    await adminDb.collection('companies').doc(companyId).set(newCompany)

    await logAuditEvent(currentUid, 'CREATE_COMPANY', 'companies', currentUser.companyId, {
      after: newCompany,
      resourceId: companyId,
    })

    return {
      success: true,
      data: newCompany,
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}

export async function updateCompanyAction(
  companyId: string,
  updates: Partial<Company>,
  token?: string
) {
  try {
    const { uid: currentUid, appUser: currentUser } = await verifyAndGetUser(token)

    if (currentUser.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar empresas')
    }

    const companyDoc = await adminDb.collection('companies').doc(companyId).get()
    if (!companyDoc.exists) {
      throw new Error('Empresa não encontrada')
    }

    const existingCompany = companyDoc.data() as Company

    const updated = {
      name: updates.name?.trim(),
      country: updates.country?.trim(),
      logoUrl: updates.logoUrl,
      active: updates.active !== undefined ? updates.active : existingCompany.active,
    }

    await adminDb.collection('companies').doc(companyId).update(updated)

    await logAuditEvent(currentUid, 'UPDATE_COMPANY', 'companies', currentUser.companyId, {
      before: existingCompany,
      after: { ...existingCompany, ...updated },
      resourceId: companyId,
    })

    return {
      success: true,
      data: { ...existingCompany, ...updated },
    }
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    }
  }
}
