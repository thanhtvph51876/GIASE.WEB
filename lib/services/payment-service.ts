import type { Payment, PaymentStatus, Payout, User } from "@/types"
import { earningApi } from "@/lib/api/earning-api"
import { paymentApi } from "@/lib/api/payment-api"

class PaymentService {
  async getSettings() {
    return paymentApi.settings()
  }

  async getPaymentsByTutor(_tutorId: string): Promise<Payment[]> {
    return paymentApi.tutorList()
  }

  async getPaymentsByStudent(_studentId: string): Promise<Payment[]> {
    return paymentApi.list()
  }

  async getAllPayments(): Promise<Payment[]> {
    return paymentApi.adminList()
  }

  async getPaymentTransactions() {
    return paymentApi.transactions()
  }

  async getWebhookEvents() {
    return paymentApi.webhookEvents()
  }

  async getRefunds() {
    return paymentApi.refunds()
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, _actor?: User | null) {
    try {
      const payment =
        status === "paid" || status === "completed"
          ? _actor?.role === "admin"
            ? await paymentApi.markPaid(paymentId)
            : null
          : status === "failed"
            ? await paymentApi.markFailed(paymentId)
            : status === "refunded"
              ? await paymentApi.refund(paymentId)
              : null
      if (!payment) {
        return { success: false, error: "Trạng thái thanh toán chỉ được cập nhật qua gateway hoặc admin." }
      }
      return { success: true, payment }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật thanh toán" }
    }
  }

  async markAsPaid(paymentId: string, actor?: User | null) {
    return this.updatePaymentStatus(paymentId, "paid", actor)
  }

  async createCheckout(paymentId: string, gateway: string) {
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin
      const checkout = await paymentApi.createCheckout(paymentId, {
        gateway,
        returnUrl: origin ? `${origin}/payments/success?paymentId=${paymentId}` : undefined,
        cancelUrl: origin ? `${origin}/payments/failed?paymentId=${paymentId}` : undefined,
      })
      return { success: true, checkout }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo phiên thanh toán" }
    }
  }

  async refreshPaymentStatus(paymentId: string) {
    try {
      const result = await paymentApi.status(paymentId)
      return { success: true, payment: result.payment, status: result.status }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể kiểm tra trạng thái thanh toán" }
    }
  }

  async getReceipt(paymentId: string) {
    return paymentApi.receipt(paymentId)
  }

  async getInvoice(paymentId: string) {
    return paymentApi.invoice(paymentId)
  }

  async markAsFailed(paymentId: string, actor?: User | null) {
    return this.updatePaymentStatus(paymentId, "failed", actor)
  }

  async refundPayment(paymentId: string, actor?: User | null) {
    return this.updatePaymentStatus(paymentId, "refunded", actor)
  }

  async getPayoutsByTutor(_tutorId: string): Promise<Payout[]> {
    return earningApi.payouts()
  }

  async getAllPayouts(): Promise<Payout[]> {
    return paymentApi.adminPayouts()
  }

  async requestPayout(_tutorId: string, _tutorName: string, amount: number) {
    try {
      const payout = await earningApi.requestPayout({ amount })
      return { success: true, payout }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo yêu cầu rút tiền" }
    }
  }

  async updatePayoutStatus(payoutId: string, status: Payout["status"], _actor?: User | null, reason?: string) {
    try {
      const payout =
        status === "completed"
          ? await paymentApi.approvePayout(payoutId)
          : await paymentApi.rejectPayout(payoutId, reason || "")
      return { success: true, payout }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật rút tiền" }
    }
  }

  async approvePayout(payoutId: string, actor?: User | null) {
    return this.updatePayoutStatus(payoutId, "completed", actor)
  }

  async rejectPayout(payoutId: string, reason: string, actor?: User | null) {
    return this.updatePayoutStatus(payoutId, "rejected", actor, reason)
  }
}

export const paymentService = new PaymentService()
