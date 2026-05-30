import type { Class, ClassSession, ClassStatus } from "@/types"
import { apiRequest } from "./client"
import { mapClass, mapList, mapSession } from "./mappers"

export const classApi = {
  async list(role?: "student" | "tutor" | "admin") {
    const path = role === "admin" ? "/admin/classes" : role === "tutor" ? "/tutor/classes" : "/classes"
    return mapList(await apiRequest<Class[]>(path), mapClass)
  },
  async get(id: string, role?: "tutor" | "admin") {
    const path = role === "admin" ? `/admin/classes/${id}` : role === "tutor" ? `/tutor/classes/${id}` : `/classes/${id}`
    return mapClass(await apiRequest<Class>(path))
  },
  async create(data: Partial<Class>) {
    return mapClass(await apiRequest<Class>("/admin/classes", { method: "POST", body: data }))
  },
  async update(id: string, data: Partial<Class>) {
    return mapClass(await apiRequest<Class>(`/admin/classes/${id}`, { method: "PATCH", body: data }))
  },
  async updateStatus(id: string, status: ClassStatus) {
    const action = status === "paused" ? "pause" : status === "completed" ? "complete" : status === "cancelled" ? "cancel" : ""
    if (action) return mapClass(await apiRequest<Class>(`/admin/classes/${id}/${action}`, { method: "POST" }))
    return mapClass(await apiRequest<Class>(`/admin/classes/${id}`, { method: "PATCH", body: { status } }))
  },
  async sessions(classId: string, admin = false) {
    const path = admin ? `/admin/classes/${classId}/sessions` : `/classes/${classId}/sessions`
    return mapList(await apiRequest<ClassSession[]>(path), mapSession)
  },
  async createSession(classId: string, data: Partial<ClassSession>) {
    return mapSession(await apiRequest<ClassSession>(`/admin/classes/${classId}/sessions`, { method: "POST", body: data }))
  },
  async allSessions(role?: "tutor" | "admin") {
    if (role === "tutor") return mapList(await apiRequest<ClassSession[]>("/tutor/sessions"), mapSession)
    if (role === "admin") return mapList(await apiRequest<ClassSession[]>("/admin/sessions"), mapSession)
    return mapList(await apiRequest<ClassSession[]>("/sessions"), mapSession)
  },
  async getSession(id: string) {
    return mapSession(await apiRequest<ClassSession>(`/sessions/${id}`))
  },
  async completeSession(id: string, note?: string, admin = false) {
    const path = admin ? `/admin/sessions/${id}/complete` : `/tutor/sessions/${id}/complete`
    return mapSession(await apiRequest<ClassSession>(path, { method: "POST", body: { note } }))
  },
  async cancelSession(id: string, reasonOrAdmin?: string | boolean, admin = false) {
    const reason = typeof reasonOrAdmin === "string" ? reasonOrAdmin : undefined
    const isAdmin = typeof reasonOrAdmin === "boolean" ? reasonOrAdmin : admin
    const path = isAdmin ? `/admin/sessions/${id}/cancel` : `/tutor/sessions/${id}/cancel`
    return mapSession(await apiRequest<ClassSession>(path, { method: "POST", body: { reason } }))
  },
}
