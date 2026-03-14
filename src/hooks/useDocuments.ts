"use client"

import { useCallback, useState } from "react"
import type { DocumentCategory } from "@/services/documents"
import {
  fetchDocuments,
  findLatestDocumentByName,
  getDocumentDownloadUrl,
  uploadDocument,
  uploadNewVersion,
} from "@/services/documents"
import { ensureOrgMembership, ensureOrganization } from "@/services/operations"
import { getActiveOrgId } from "@/lib/active-org"

export type DocumentRecord = {
  id: string
  fileName: string
  filePath: string
  fileSize: number | null
  mimeType: string | null
  category: DocumentCategory
  tags: string[]
  version: number
  parentDocumentId: string | null
  uploadedBy: string | null
  createdAt: string
}

export type FetchDocumentsOptions = {
  category?: DocumentCategory
  search?: string
}

export function useDocuments() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<FetchDocumentsOptions>({})

  const ensureOrg = useCallback(async () => {
    if (organizationId) return organizationId
    const activeOrgId = getActiveOrgId()
    if (activeOrgId) {
      setOrganizationId(activeOrgId)
      return activeOrgId
    }
    const id = await ensureOrganization(orgName, orgType)
    await ensureOrgMembership(id, "owner")
    setOrganizationId(id)
    return id
  }, [organizationId, orgName, orgType])

  const loadDocuments = useCallback(
    async (options: FetchDocumentsOptions = {}) => {
      setLoading(true)
      setError(null)
      setLastQuery(options)
      try {
        const orgId = await ensureOrg()
        const data = await fetchDocuments(orgId, options)
        const mapped: DocumentRecord[] = (data ?? []).map((row) => ({
          id: row.id as string,
          fileName: row.file_name as string,
          filePath: row.file_path as string,
          fileSize: (row.file_size as number | null) ?? null,
          mimeType: (row.mime_type as string | null) ?? null,
          category: row.category as DocumentCategory,
          tags: (row.tags as string[]) ?? [],
          version: (row.version as number) ?? 1,
          parentDocumentId: (row.parent_document_id as string | null) ?? null,
          uploadedBy: (row.uploaded_by as string | null) ?? null,
          createdAt: row.created_at as string,
        }))
        setDocuments(mapped)
        setLoading(false)
        return mapped
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load documents."
        setError(message)
        setLoading(false)
        return []
      }
    },
    [ensureOrg]
  )

  const addDocument = useCallback(
    async (input: {
      file: File
      category: DocumentCategory
      tags: string[]
    }) => {
      setLoading(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        const result = await uploadDocument({
          organizationId: orgId,
          file: input.file,
          category: input.category,
          tags: input.tags,
        })
        setLoading(false)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed."
        setError(message)
        setLoading(false)
        return null
      }
    },
    [ensureOrg]
  )

  const findExistingDocument = useCallback(
    async (fileName: string, category: DocumentCategory) => {
      const orgId = await ensureOrg()
      const data = await findLatestDocumentByName(orgId, category, fileName)
      if (!data) return null
      const mapped: DocumentRecord = {
        id: data.id as string,
        fileName: data.file_name as string,
        filePath: data.file_path as string,
        fileSize: (data.file_size as number | null) ?? null,
        mimeType: (data.mime_type as string | null) ?? null,
        category: data.category as DocumentCategory,
        tags: (data.tags as string[]) ?? [],
        version: (data.version as number) ?? 1,
        parentDocumentId: (data.parent_document_id as string | null) ?? null,
        uploadedBy: (data.uploaded_by as string | null) ?? null,
        createdAt: data.created_at as string,
      }
      return mapped
    },
    [ensureOrg]
  )

  const addDocumentVersion = useCallback(
    async (input: {
      file: File
      tags: string[]
      existingDocument: DocumentRecord
    }) => {
      setLoading(true)
      setError(null)
      try {
        const orgId = await ensureOrg()
        const result = await uploadNewVersion({
          organizationId: orgId,
          file: input.file,
          existingDocument: {
            id: input.existingDocument.id,
            file_name: input.existingDocument.fileName,
            category: input.existingDocument.category,
            tags: input.existingDocument.tags,
            version: input.existingDocument.version,
            parent_document_id: input.existingDocument.parentDocumentId,
          },
          tags: input.tags,
        })
        setLoading(false)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed."
        setError(message)
        setLoading(false)
        return null
      }
    },
    [ensureOrg]
  )

  const downloadDocument = useCallback(async (document: DocumentRecord) => {
    const url = await getDocumentDownloadUrl(document.filePath)
    return url
  }, [])

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    documents,
    loading,
    error,
    lastQuery,
    loadDocuments,
    addDocument,
    addDocumentVersion,
    findExistingDocument,
    downloadDocument,
  }
}
