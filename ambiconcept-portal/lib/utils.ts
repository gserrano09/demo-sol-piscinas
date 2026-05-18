import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Timestamp } from 'firebase/firestore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return '—'
  return format(ts.toDate(), 'd MMM yyyy', { locale: pt })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/'))       return '🖼'
  if (mimeType.startsWith('video/'))       return '🎬'
  if (mimeType === 'application/pdf')      return '📄'
  if (mimeType.includes('zip'))            return '🗜'
  if (mimeType.includes('word'))           return '📝'
  if (mimeType.includes('presentation'))  return '📊'
  return '📁'
}
