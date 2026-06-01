import type { BookingStatus, PublicTrialBookingRequestResult, TrialBooking, TrialBookingFormData } from "@/types"
import type { PageRequestParams } from "@/lib/api/client"
import { bookingApi } from "@/lib/api/booking-api"

class BookingService {
  async createTrialBooking(
    tutorId: string,
    data: TrialBookingFormData,
    _userId?: string,
    options: { learningRequestId?: string; skipSideEffects?: boolean } = {}
  ) {
    try {
      const booking = await bookingApi.create(tutorId, data, options.learningRequestId)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể tạo booking" }
    }
  }

  async createPublicTrialBookingRequest(
    tutorId: string,
    data: TrialBookingFormData
  ): Promise<{ success: true; request: PublicTrialBookingRequestResult } | { success: false; error: string }> {
    try {
      const request = await bookingApi.createPublicTrialRequest(tutorId, data)
      return { success: true, request }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Không thể gửi yêu cầu học thử",
      }
    }
  }

  async getBookingsByTutor(_tutorId: string): Promise<TrialBooking[]> {
    return bookingApi.tutorList()
  }

  async getBookingsByUser(_userId: string): Promise<TrialBooking[]> {
    return bookingApi.list()
  }

  async getPendingBookingsByTutor(tutorId: string): Promise<TrialBooking[]> {
    const bookings = await this.getBookingsByTutor(tutorId)
    return bookings.filter((booking) => booking.status === "pending" || booking.status === "assigned")
  }

  async getBookingById(id: string): Promise<TrialBooking | null> {
    try {
      return await bookingApi.get(id)
    } catch {
      return null
    }
  }

  async updateBookingStatus(id: string, status: BookingStatus, rejectReason?: string) {
    if (status === "accepted") return this.acceptBooking(id)
    if (status === "rejected") return this.rejectBooking(id, rejectReason || "")
    if (status === "completed") return this.completeBooking(id)
    try {
      const booking = await bookingApi.update(id, { status, rejectReason })
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật booking" }
    }
  }

  async updateBooking(id: string, payload: Partial<TrialBooking>) {
    try {
      const booking = await bookingApi.update(id, payload)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể cập nhật booking" }
    }
  }

  async acceptBooking(id: string, schedule?: unknown) {
    try {
      const booking = await bookingApi.accept(id, schedule)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể chấp nhận booking" }
    }
  }

  async rejectBooking(id: string, reason: string) {
    try {
      const booking = await bookingApi.reject(id, reason)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể từ chối booking" }
    }
  }

  async completeBooking(id: string, resultNote?: string) {
    try {
      const booking = await bookingApi.complete(id, resultNote)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hoàn tất booking" }
    }
  }

  async scheduleTrial(id: string, schedule: NonNullable<TrialBooking["schedule"]>) {
    try {
      const booking = await bookingApi.schedule(id, { schedule })
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể xếp lịch học thử" }
    }
  }

  async completeTrial(id: string, resultNote?: string) {
    return this.completeBooking(id, resultNote)
  }

  async convertToClass(id: string) {
    try {
      const createdClass = await bookingApi.convertToClass(id)
      const booking = await bookingApi.adminGet(id)
      return { success: true, booking: { ...booking, classId: (createdClass as any).id } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể chuyển thành lớp" }
    }
  }

  async getAllBookings(): Promise<TrialBooking[]> {
    return bookingApi.adminList()
  }

  getAllBookingsPage(params?: PageRequestParams) {
    return bookingApi.adminListPage(params)
  }

  async getAdminBookingById(id: string): Promise<TrialBooking | null> {
    try {
      return await bookingApi.adminGet(id)
    } catch {
      return null
    }
  }

  async assignTutorByAdmin(id: string, tutorId: string) {
    try {
      const booking = await bookingApi.adminAssignTutor(id, tutorId)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể gán lại gia sư cho booking" }
    }
  }

  async cancelBookingByAdmin(id: string, reason?: string) {
    try {
      const booking = await bookingApi.adminCancel(id, reason)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể hủy booking bằng quyền admin" }
    }
  }

  async markStudentNoShow(id: string, note?: string) {
    try {
      const booking = await bookingApi.adminMarkNoShowStudent(id, note)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể ghi nhận học viên no-show" }
    }
  }

  async markTutorNoShow(id: string, note?: string) {
    try {
      const booking = await bookingApi.adminMarkNoShowTutor(id, note)
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Không thể ghi nhận gia sư no-show" }
    }
  }

  async getPendingCount(tutorId: string): Promise<number> {
    const bookings = await this.getPendingBookingsByTutor(tutorId)
    return bookings.length
  }
}

export const bookingService = new BookingService()
