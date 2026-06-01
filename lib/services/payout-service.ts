import type { User } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { paymentService } from "./payment-service"

export interface PayoutRequestInput {
  amount: number
  bankName: string
  bankAccount: string
  accountHolder: string
  note?: string
}

class PayoutService {
  getPayoutsByTutor(tutorId: string) {
    return paymentService.getPayoutsByTutor(tutorId)
  }

  getAllPayouts() {
    return paymentService.getAllPayouts()
  }

  getAllPayoutsPage(params?: PageRequestParams) {
    return paymentService.getAllPayoutsPage(params)
  }

  getPayoutById(payoutId: string) {
    return paymentService.getAdminPayout(payoutId)
  }

  requestPayout(tutorId: string, tutorName: string, input: number | PayoutRequestInput) {
    return paymentService.requestPayout(tutorId, tutorName, input)
  }

  approvePayout(payoutId: string, actor?: User | null, reason?: string) {
    return paymentService.approvePayout(payoutId, actor, reason)
  }

  rejectPayout(payoutId: string, reason: string, actor?: User | null) {
    return paymentService.rejectPayout(payoutId, reason, actor)
  }
}

export const payoutService = new PayoutService()
