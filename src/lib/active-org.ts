const STORAGE_KEY = "complycare.activeOrgId"

export function getActiveOrgId() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export function setActiveOrgId(orgId: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, orgId)
}

export function clearActiveOrgId() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}
