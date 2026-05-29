import type { UserVerification, VerificationStatus, VerificationType } from "@/types"
import { verificationApi, type StudentCardUploadInput, type TutorDocumentUploadInput } from "@/lib/api/verification-api"

class VerificationService {
  getStudentVerifications(): Promise<UserVerification[]> {
    return verificationApi.myStudentVerifications()
  }

  getTutorVerifications(): Promise<UserVerification[]> {
    return verificationApi.myTutorVerifications()
  }

  getTutorTerms() {
    return verificationApi.tutorTerms()
  }

  uploadStudentCard(input: StudentCardUploadInput) {
    return verificationApi.uploadStudentCard(input)
  }

  uploadStudentSelfie(id: string, file: File) {
    return verificationApi.uploadStudentSelfie(id, file)
  }

  async signAndSubmitStudent(id: string, signerFullName: string, signerEmail?: string) {
    await verificationApi.signStudentAgreement(id, signerFullName, signerEmail)
    return verificationApi.submitStudent(id)
  }

  uploadTutorDocument(input: TutorDocumentUploadInput) {
    return verificationApi.uploadTutorDocument(input)
  }

  async signAndSubmitTutor(id: string, signerFullName: string, signerEmail?: string) {
    await verificationApi.signTutorAgreement(id, signerFullName, signerEmail)
    return verificationApi.submitTutor(id)
  }

  adminList(params?: { status?: VerificationStatus | "all"; type?: VerificationType | "all" }) {
    return verificationApi.adminList(params)
  }

  approve(id: string) {
    return verificationApi.approve(id)
  }

  reject(id: string, reason: string) {
    return verificationApi.reject(id, reason)
  }

  needMoreInfo(id: string, reason: string) {
    return verificationApi.needMoreInfo(id, reason)
  }
}

export const verificationService = new VerificationService()
