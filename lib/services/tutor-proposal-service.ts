import { apiRequest } from "@/lib/api/client"
import type { TutorLead, TutorProposal } from "@/types"

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
    return apiRequest<TutorLead[]>("/tutor/leads", { params })
  }

  getTutorLead(requestId: string) {
    return apiRequest<TutorLead>(`/tutor/leads/${requestId}`)
  }

  createProposal(requestId: string, payload: TutorProposalPayload) {
    return apiRequest<TutorProposal>(`/tutor/leads/${requestId}/proposals`, {
      method: "POST",
      body: payload,
    })
  }

  getTutorProposals() {
    return apiRequest<TutorProposal[]>("/tutor/proposals")
  }

  updateProposal(proposalId: string, payload: Partial<TutorProposalPayload>) {
    return apiRequest<TutorProposal>(`/tutor/proposals/${proposalId}`, { method: "PATCH", body: payload })
  }

  withdrawProposal(proposalId: string, note?: string) {
    return apiRequest<TutorProposal>(`/tutor/proposals/${proposalId}/withdraw`, {
      method: "POST",
      body: { note },
    })
  }

  getParentProposals() {
    return apiRequest<TutorProposal[]>("/parent/proposals")
  }

  acceptProposal(proposalId: string) {
    return apiRequest<TutorProposal>(`/parent/proposals/${proposalId}/accept`, { method: "POST" })
  }

  rejectProposal(proposalId: string, reason?: string) {
    return apiRequest<TutorProposal>(`/parent/proposals/${proposalId}/reject`, {
      method: "POST",
      body: { reason },
    })
  }
}

export const tutorProposalService = new TutorProposalService()
