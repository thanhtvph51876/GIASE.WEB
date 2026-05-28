import { apiRequest } from "@/lib/api/client"

export interface TutorProposalPayload {
  proposedFee: number
  feeUnit: string
  teachingMode: string
  availableSlots?: unknown[]
  proposedStartDate?: string
  teachingPlan: string
  relevantExperience?: string
  expectedOutcome?: string
  messageToParent?: string
  trialSessionType?: string
  trialFee?: number
  expiresAt?: string
}

class TutorProposalService {
  getTutorLeads(params?: Record<string, unknown>) {
    return apiRequest<Record<string, unknown>[]>("/tutor/leads", { params })
  }

  getTutorLead(requestId: string) {
    return apiRequest<Record<string, unknown>>(`/tutor/leads/${requestId}`)
  }

  createProposal(requestId: string, payload: TutorProposalPayload) {
    return apiRequest<Record<string, unknown>>(`/tutor/leads/${requestId}/proposals`, {
      method: "POST",
      body: payload,
    })
  }

  getTutorProposals() {
    return apiRequest<Record<string, unknown>[]>("/tutor/proposals")
  }

  updateProposal(proposalId: string, payload: Partial<TutorProposalPayload>) {
    return apiRequest<Record<string, unknown>>(`/tutor/proposals/${proposalId}`, { method: "PATCH", body: payload })
  }

  withdrawProposal(proposalId: string, note?: string) {
    return apiRequest<Record<string, unknown>>(`/tutor/proposals/${proposalId}/withdraw`, {
      method: "POST",
      body: { note },
    })
  }

  getParentProposals() {
    return apiRequest<Record<string, unknown>[]>("/parent/proposals")
  }

  acceptProposal(proposalId: string) {
    return apiRequest<Record<string, unknown>>(`/parent/proposals/${proposalId}/accept`, { method: "POST" })
  }

  rejectProposal(proposalId: string, reason?: string) {
    return apiRequest<Record<string, unknown>>(`/parent/proposals/${proposalId}/reject`, {
      method: "POST",
      body: { reason },
    })
  }
}

export const tutorProposalService = new TutorProposalService()
