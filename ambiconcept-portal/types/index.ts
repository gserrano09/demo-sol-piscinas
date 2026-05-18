import { Timestamp } from 'firebase/firestore'

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export type UserRole = 'admin' | 'distribuidor' | 'parceiro'

export interface AppUser {
  uid:       string
  name:      string
  email:     string
  role:      UserRole
  companyId: string
  createdAt: Timestamp | Date | any
  lastLogin?: Timestamp | Date | any
  active:    boolean
}

// ─────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────
export interface Company {
  id:        string
  name:      string
  country:   string
  logoUrl?:  string
  createdAt: Timestamp | Date | any
  active:    boolean
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────
export interface Product {
  id:          string
  name:        string
  description: string
  companyId:   string
  imageUrl?:   string
  tags:        string[]
  createdAt:   Timestamp | Date | any
  updatedAt:   Timestamp | Date | any
  active:      boolean
}

// ─────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────
export type ResourceType =
  | 'renders'
  | 'doc_tecnica'
  | 'doc_comercial'
  | 'social'
  | 'campanhas'
  | 'catalogos'

export interface Resource {
  id:          string
  name:        string
  type:        ResourceType
  url:         string
  storagePath: string
  productId:   string
  companyId:   string
  mimeType:    string
  size:        number
  uploadedBy:  string
  createdAt:   Timestamp | Date | any
}

// ─────────────────────────────────────────────
// Role permissions
// ─────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, ResourceType[]> = {
  admin:       ['renders','doc_tecnica','doc_comercial','social','campanhas','catalogos'],
  distribuidor: ['catalogos','doc_tecnica','doc_comercial','renders','social'],
  parceiro:    ['doc_comercial','campanhas','renders'],
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  renders:     'Renders',
  doc_tecnica: 'Documentação Técnica',
  doc_comercial: 'Documentação Comercial',
  social:      'Redes Sociais',
  campanhas:   'Campanhas',
  catalogos:   'Catálogos',
}

export const STORAGE_FOLDER_MAP: Record<ResourceType, string> = {
  renders:      'renders',
  doc_tecnica:  'doc_tecnica',
  doc_comercial:'doc_comercial',
  social:       'material_redes_sociais',
  campanhas:    'campanhas_sensibilizacao',
  catalogos:    'catalogos',
}

// ─────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────
export interface AuditLog {
  id:        string
  userId:    string
  action:    string
  resource:  string
  companyId: string
  resourceId?: string
  before?:   any
  after?:    any
  timestamp: Timestamp | any
  ipAddress: string
  userAgent: string
}
