import { createClient } from "@/utils/supabase/client"
import { LIST_LIMIT } from "@/lib/query-limits"

export type DocumentCategory = "policy" | "contract" | "report" | "evidence" | "other"

type UploadDocumentInput = {
  organizationId: string
  file: File
  category: DocumentCategory
  tags?: string[]
  parentDocumentId?: string | null
  version?: number
}

type UploadDocumentResult = {
  id: string
  filePath: string
}

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
])

function normalizeTags(tags?: string[]) {
  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function buildStoragePath(organizationId: string, fileName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `${organizationId}/${timestamp}-${safeName}`
}

export async function uploadDocument({
  organizationId,
  file,
  category,
  tags,
  parentDocumentId = null,
  version = 1,
}: UploadDocumentInput): Promise<UploadDocumentResult> {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, XLSX, or PNG.")
  }

  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const storagePath = buildStoragePath(organizationId, file.name)
  const { error: storageError } = await supabase.storage
    .from("compliance-documents")
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (storageError) throw storageError

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: organizationId,
      title: file.name,
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      category,
      tags: normalizeTags(tags),
      version,
      parent_document_id: parentDocumentId,
      uploaded_by: userId,
    })
    .select("id")
    .single()

  if (error) throw error
  return { id: data.id as string, filePath: storagePath }
}

type FetchDocumentsOptions = {
  category?: DocumentCategory
  search?: string
}

export async function findLatestDocumentByName(
  organizationId: string,
  category: DocumentCategory,
  fileName: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, file_name, file_path, file_size, mime_type, category, tags, version, parent_document_id, uploaded_by, created_at"
    )
    .eq("organization_id", organizationId)
    .eq("category", category)
    .eq("file_name", fileName)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchDocuments(
  organizationId: string,
  options: FetchDocumentsOptions = {}
) {
  const supabase = createClient()
  let query = supabase
    .from("documents")
    .select(
      "id, file_name, file_path, file_size, mime_type, category, tags, version, parent_document_id, uploaded_by, created_at"
    )
    .eq("organization_id", organizationId)

  if (options.category) {
    query = query.eq("category", options.category)
  }

  if (options.search) {
    query = query.textSearch("search_vector", options.search, {
      type: "plain",
      config: "english",
    })
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT)
  if (error) throw error
  return data ?? []
}

export async function getDocumentDownloadUrl(filePath: string, expiresIn = 120) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from("compliance-documents")
    .createSignedUrl(filePath, expiresIn)

  if (error) throw error
  return data.signedUrl
}

type UploadNewVersionInput = {
  organizationId: string
  file: File
  existingDocument: {
    id: string
    file_name: string
    category: DocumentCategory
    tags: string[]
    version: number
    parent_document_id?: string | null
  }
  tags?: string[]
}

export async function uploadNewVersion({
  organizationId,
  file,
  existingDocument,
  tags,
}: UploadNewVersionInput): Promise<UploadDocumentResult> {
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported file type. Upload PDF, DOCX, XLSX, or PNG.")
  }

  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  const userId = userData.user?.id
  if (!userId) throw new Error("No authenticated user")

  const storagePath = buildStoragePath(organizationId, file.name)
  const { error: storageError } = await supabase.storage
    .from("compliance-documents")
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (storageError) throw storageError

  const parentId = existingDocument.parent_document_id ?? existingDocument.id
  const nextVersion = existingDocument.version + 1
  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: organizationId,
      title: existingDocument.file_name,
      file_name: existingDocument.file_name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      category: existingDocument.category,
      tags: normalizeTags(tags ?? existingDocument.tags),
      version: nextVersion,
      parent_document_id: parentId,
      uploaded_by: userId,
    })
    .select("id")
    .single()

  if (error) throw error
  return { id: data.id as string, filePath: storagePath }
}
