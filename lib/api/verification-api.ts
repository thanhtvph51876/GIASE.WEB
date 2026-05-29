import type { UserVerification, VerificationStatus, VerificationTerms, VerificationType } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapVerification } from "./mappers"

export interface StudentCardUploadInput {
  file: File
  schoolName?: string
  studentCode?: string
  fullNameInput?: string
  schoolEmail?: string
}

export interface TutorDocumentUploadInput extends StudentCardUploadInput {
  verificationType?: Exclude<VerificationType, "student_card">
}

export const verificationApi = {
  async uploadStudentCard(input: StudentCardUploadInput) {
    const form = verificationForm(input)
    return mapVerification(await apiRequest<UserVerification>("/student/verifications/student-card/upload", { method: "POST", body: form }))
  },
  async uploadStudentSelfie(id: string, file: File) {
    const form = new FormData()
    form.append("file", file)
    return mapVerification(await apiRequest<UserVerification>(`/student/verifications/${id}/selfie/upload`, { method: "POST", body: form }))
  },
  async myStudentVerifications() {
    return mapList(await apiRequest<UserVerification[]>("/student/verifications/me"), mapVerification)
  },
  async signStudentAgreement(id: string, signerFullName: string, signerEmail?: string) {
    return mapVerification(await apiRequest<UserVerification>(`/student/verifications/${id}/agreement/sign`, {
      method: "POST",
      body: { signerFullName, signerEmail },
    }))
  },
  async submitStudent(id: string) {
    return mapVerification(await apiRequest<UserVerification>(`/student/verifications/${id}/submit`, { method: "POST" }))
  },
  async uploadTutorDocument(input: TutorDocumentUploadInput) {
    const form = verificationForm(input)
    form.set("verificationType", input.verificationType || "tutor_identity")
    return mapVerification(await apiRequest<UserVerification>("/tutor/verifications/document/upload", { method: "POST", body: form }))
  },
  async myTutorVerifications() {
    return mapList(await apiRequest<UserVerification[]>("/tutor/verifications/me"), mapVerification)
  },
  async tutorTerms() {
    return apiRequest<VerificationTerms>("/verification/terms/tutor")
  },
  async signTutorAgreement(id: string, signerFullName: string, signerEmail?: string) {
    return mapVerification(await apiRequest<UserVerification>(`/tutor/verifications/${id}/agreement/sign`, {
      method: "POST",
      body: { signerFullName, signerEmail },
    }))
  },
  async submitTutor(id: string) {
    return mapVerification(await apiRequest<UserVerification>(`/tutor/verifications/${id}/submit`, { method: "POST" }))
  },
  async adminList(params?: { status?: VerificationStatus | "all"; type?: VerificationType | "all" }) {
    return mapList(await apiRequest<UserVerification[]>("/admin/verifications", { params }), mapVerification)
  },
  async adminGet(id: string) {
    return mapVerification(await apiRequest<UserVerification>(`/admin/verifications/${id}`))
  },
  async approve(id: string) {
    return mapVerification(await apiRequest<UserVerification>(`/admin/verifications/${id}/approve`, { method: "POST" }))
  },
  async reject(id: string, reason: string) {
    return mapVerification(await apiRequest<UserVerification>(`/admin/verifications/${id}/reject`, { method: "POST", body: { reason } }))
  },
  async needMoreInfo(id: string, reason: string) {
    return mapVerification(await apiRequest<UserVerification>(`/admin/verifications/${id}/need-more-info`, { method: "POST", body: { reason } }))
  },
}

function verificationForm(input: StudentCardUploadInput) {
  const form = new FormData()
  form.append("file", input.file)
  if (input.schoolName) form.append("schoolName", input.schoolName)
  if (input.studentCode) form.append("studentCode", input.studentCode)
  if (input.fullNameInput) form.append("fullNameInput", input.fullNameInput)
  if (input.schoolEmail) form.append("schoolEmail", input.schoolEmail)
  return form
}
