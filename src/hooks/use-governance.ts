"use client"

import { useMemo, useState } from "react"
import type {
  AccessReview,
  AccessReviewItem,
  BaaRecord,
  Risk,
  Vendor,
} from "@/types/governance"
import { ensureOrgMembership, ensureOrganization, logAuditEvent } from "@/services/operations"
import { getActiveOrgId } from "@/lib/active-org"
import {
  addAccessReviewItem,
  addRiskAction,
  createAccessReview,
  createBaa,
  createRisk,
  createVendor,
  createVendorAssessment,
  updateAccessReviewDecision,
} from "@/services/governance"

export function useGovernance() {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("Northwind Family Clinic")
  const [orgType, setOrgType] = useState("Primary Care")
  const [risks, setRisks] = useState<Risk[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [accessReviews, setAccessReviews] = useState<AccessReview[]>([])
  const [saving, setSaving] = useState(false)

  async function ensureOrg() {
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
  }

  async function addRisk(title: string, severity: "low" | "medium" | "high") {
    setSaving(true)
    const orgId = await ensureOrg()
    const created = await createRisk(orgId, title, severity)
    const risk: Risk = {
      id: created.id,
      title,
      severity,
      status: "open",
      createdAt: created.created_at,
      actions: [],
    }
    setRisks((prev) => [risk, ...prev])
    await logAuditEvent(orgId, "Risk logged", "risk", created.id)
    setSaving(false)
  }

  async function addMitigation(riskId: string, action: string, dueDate?: string) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await addRiskAction(riskId, action, dueDate)
    setRisks((prev) =>
      prev.map((risk) =>
        risk.id === riskId
          ? {
              ...risk,
              actions: [
                ...risk.actions,
                { id, action, status: "planned", dueDate },
              ],
              status: "mitigating",
            }
          : risk
      )
    )
    await logAuditEvent(orgId, "Risk mitigation added", "risk_action", id)
    setSaving(false)
  }

  async function addVendor(name: string, criticality: "low" | "medium" | "high") {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createVendor(orgId, name, criticality)
    const vendor: Vendor = {
      id,
      name,
      criticality,
      status: "active",
    }
    setVendors((prev) => [vendor, ...prev])
    await logAuditEvent(orgId, "Vendor added", "vendor", id)
    setSaving(false)
  }

  async function addVendorAssessment(
    vendorId: string,
    score: number,
    status: "pending" | "approved" | "needs_followup",
    notes?: string
  ) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createVendorAssessment(vendorId, score, status, notes)
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              assessment: { id, score, status, notes },
            }
          : vendor
      )
    )
    await logAuditEvent(orgId, "Vendor assessed", "vendor_assessment", id)
    setSaving(false)
  }

  async function addBaa(
    vendorId: string,
    status: "pending" | "signed" | "expired",
    renewalDate?: string
  ) {
    setSaving(true)
    const orgId = await ensureOrg()
    const id = await createBaa(vendorId, status, renewalDate)
    const record: BaaRecord = { id, status, renewalDate }
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              baa: record,
            }
          : vendor
      )
    )
    await logAuditEvent(orgId, "BAA updated", "baa", id)
    setSaving(false)
  }

  async function addAccessReview(title: string, subjects: string[]) {
    setSaving(true)
    const orgId = await ensureOrg()
    const created = await createAccessReview(orgId, title)
    const items: AccessReviewItem[] = []
    for (const subject of subjects) {
      const id = await addAccessReviewItem(created.id, subject)
      items.push({ id, subject, decision: "pending" })
    }
    const review: AccessReview = {
      id: created.id,
      title,
      status: "open",
      createdAt: created.created_at,
      items,
    }
    setAccessReviews((prev) => [review, ...prev])
    await logAuditEvent(orgId, "Access review created", "access_review", created.id)
    setSaving(false)
  }

  async function updateAccessDecision(
    reviewId: string,
    itemId: string,
    decision: "pending" | "approved" | "revoked"
  ) {
    setSaving(true)
    const orgId = await ensureOrg()
    await updateAccessReviewDecision(itemId, decision)
    setAccessReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              items: review.items.map((item) =>
                item.id === itemId ? { ...item, decision } : item
              ),
            }
          : review
      )
    )
    await logAuditEvent(orgId, "Access review updated", "access_review_item", itemId)
    setSaving(false)
  }

  const reporting = useMemo(() => {
    const openRisks = risks.filter((risk) => risk.status !== "closed").length
    const vendorCoverage = vendors.filter((vendor) => vendor.assessment).length
    const baaCoverage = vendors.filter((vendor) => vendor.baa?.status === "signed").length
    const reviewCompletion = accessReviews.reduce((acc, review) => {
      if (review.items.length === 0) return acc
      const completed = review.items.filter((item) => item.decision !== "pending").length
      return acc + Math.round((completed / review.items.length) * 100)
    }, 0)
    const reviewScore = accessReviews.length
      ? Math.round(reviewCompletion / accessReviews.length)
      : 0

    return {
      openRisks,
      vendorCoverage,
      baaCoverage,
      reviewScore,
    }
  }, [accessReviews, risks, vendors])

  return {
    orgName,
    orgType,
    setOrgName,
    setOrgType,
    risks,
    vendors,
    accessReviews,
    saving,
    reporting,
    addRisk,
    addMitigation,
    addVendor,
    addVendorAssessment,
    addBaa,
    addAccessReview,
    updateAccessDecision,
  }
}
