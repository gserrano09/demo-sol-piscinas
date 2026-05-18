import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase'
import { STORAGE_FOLDER_MAP } from '@/types'
import type { ResourceType } from '@/types'

export interface UploadProgress {
  progress: number
  url?: string
  path?: string
  error?: string
}

export function uploadResource(
  file: File,
  companyId: string,
  productId: string,
  type: ResourceType,
  onProgress: (p: UploadProgress) => void,
): () => void {
  const folder = STORAGE_FOLDER_MAP[type]
  const path   = `companies/${companyId}/products/${productId}/${folder}/${Date.now()}_${file.name}`
  const sRef   = ref(storage, path)
  const task   = uploadBytesResumable(sRef, file)

  task.on(
    'state_changed',
    snap => onProgress({ progress: Math.round(snap.bytesTransferred / snap.totalBytes * 100) }),
    err  => onProgress({ progress: 0, error: err.message }),
    async () => {
      const url = await getDownloadURL(task.snapshot.ref)
      onProgress({ progress: 100, url, path })
    },
  )

  return () => task.cancel()
}

export async function deleteStorageFile(path: string): Promise<void> {
  await deleteObject(ref(storage, path))
}
