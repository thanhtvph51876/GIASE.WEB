import type { AuditLog } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { adminApi } from "@/lib/api/admin-api"

export interface CreateAuditLogData {
  actorId: string
  actorName: string
  actorRole: AuditLog["actorRole"]
  action: string
  entityType: string
  entityId: string
  entityName?: string
  before?: unknown
  after?: unknown
  description?: string
  note?: string
  metadata?: Record<string, unknown>
}

class AuditLogService {
  async createLog(_data: CreateAuditLogData): Promise<AuditLog | null> {
    return null
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return adminApi.auditLogs() as Promise<AuditLog[]>
  }

  getAllLogsPage(params?: PageRequestParams) {
    return adminApi.auditLogsPage(params)
  }

  async getLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return (await this.getAllLogs()).filter((log) => log.entityType === entityType && log.entityId === entityId)
  }

  async getLogsByActor(actorId: string): Promise<AuditLog[]> {
    return (await this.getAllLogs()).filter((log) => log.actorId === actorId)
  }
}

export const auditLogService = new AuditLogService()
