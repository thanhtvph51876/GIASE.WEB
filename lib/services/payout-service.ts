import type { User } from "@/types"
import { paymentService } from "./payment-service"

class PayoutService {
  getPayoutsByTutor(tutorId: string) {
    return paymentService.getPayoutsByTutor(tutorId)
  }

  getAllPayouts() {
    return paymentService.getAllPayouts()
  }

  requestPayout(tutorId: string, tutorName: string, amount: number) {
    return paymentService.requestPayout(tutorId, tutorName, amount)
  }

  approvePayout(payoutId: string, actor?: User | null) {
    return paymentService.approvePayout(payoutId, actor)
  }

  rejectPayout(payoutId: string, reason: string, actor?: User | null) {
    return paymentService.rejectPayout(payoutId, reason, actor)
  }
}

export const payoutService = new PayoutService()
