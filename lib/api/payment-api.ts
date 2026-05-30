import type { Payment, Payout } from "@/types"
import { apiRequest } from "./client"
import { mapList, mapPayment, mapPayout } from "./mappers"

export interface PaymentSettings {
  paymentMode: "sandbox" | "production"
  enabledGateways: string[]
  defaultGateway: string
  paymentTimeoutMinutes: number
  refundPolicy?: string
  invoicePrefix?: string
  receiptPrefix?: string
}

export interface PaymentCheckout {
  payment: Payment
  gateway: string
  gatewayOrderId: string
  checkoutUrl?: string
  qrCodeUrl?: string
  expiredAt?: string
  status: string
}

export interface PaymentTransaction {
  id: string
  paymentId: string
  gateway: string
  gatewayOrderId?: string
  gatewayTransactionId?: string
  amount: number
  currency: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface PaymentWebhookEvent {
  id: string
  gateway: string
  eventId?: string
  paymentId?: string
  gatewayOrderId?: string
  gatewayTransactionId?: string
  signatureValid: boolean
  processed: boolean
  processingError?: string
  receivedAt: string
  processedAt?: string
}

export interface PaymentRefund {
  id: string
  paymentId: string
  amount: number
  reason?: string
  status: string
  gatewayRefundId?: string
  createdAt: string
  updatedAt?: string
}

export const paymentApi = {
  async settings() {
    return apiRequest<PaymentSettings>("/payments/settings")
  },
  async list() {
    return mapList(await apiRequest<Payment[]>("/payments"), mapPayment)
  },
  async adminList() {
    return mapList(await apiRequest<Payment[]>("/admin/payments"), mapPayment)
  },
  async tutorList() {
    return mapList(await apiRequest<Payment[]>("/tutor/payments"), mapPayment)
  },
  async tutorPayouts() {
    return mapList(await apiRequest<Payout[]>("/tutor/payouts"), mapPayout)
  },
  async adminPayouts() {
    return mapList(await apiRequest<Payout[]>("/admin/payouts"), mapPayout)
  },
  createCheckout(id: string, data: { gateway?: string; returnUrl?: string; cancelUrl?: string }) {
    return apiRequest<PaymentCheckout>(`/payments/${id}/create-checkout`, { method: "POST", body: data }).then((checkout) => ({
      ...checkout,
      payment: mapPayment(checkout.payment),
    }))
  },
  status(id: string) {
    return apiRequest<{ payment: Payment; status: string }>(`/payments/${id}/status`).then((result) => ({
      ...result,
      payment: mapPayment(result.payment),
    }))
  },
  invoice(id: string) {
    return apiRequest<Record<string, unknown>>(`/payments/${id}/invoice`)
  },
  receipt(id: string) {
    return apiRequest<Record<string, unknown>>(`/payments/${id}/receipt`)
  },
  markPaid(id: string, reason = "Admin đối soát thủ công từ dashboard") {
    return apiRequest<Payment>(`/admin/payments/${id}/mark-paid`, { method: "POST", body: { reason } }).then(mapPayment)
  },
  markFailed(id: string, reason?: string) {
    return apiRequest<Payment>(`/admin/payments/${id}/mark-failed`, { method: "POST", body: { reason } }).then(mapPayment)
  },
  refund(id: string, data?: { amount?: number; reason?: string }) {
    return apiRequest<Payment>(`/admin/payments/${id}/refund`, {
      method: "POST",
      body: { reason: "Admin xử lý hoàn tiền từ dashboard", ...data },
    }).then(mapPayment)
  },
  transactions() {
    return apiRequest<PaymentTransaction[]>("/admin/payment-transactions")
  },
  webhookEvents() {
    return apiRequest<PaymentWebhookEvent[]>("/admin/payment-webhook-events")
  },
  refunds() {
    return apiRequest<PaymentRefund[]>("/admin/refunds")
  },
  requestPayout(data: Partial<Payout>) {
    return apiRequest<Payout>("/tutor/payouts", { method: "POST", body: data }).then(mapPayout)
  },
  approvePayout(id: string, reason?: string) {
    return apiRequest<Payout>(`/admin/payouts/${id}/approve`, { method: "POST", body: { reason } }).then(mapPayout)
  },
  rejectPayout(id: string, reason: string) {
    return apiRequest<Payout>(`/admin/payouts/${id}/reject`, { method: "POST", body: { reason } }).then(mapPayout)
  },
}
