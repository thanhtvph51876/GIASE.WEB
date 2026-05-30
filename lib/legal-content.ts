export interface LegalSection {
  heading: string
  items: string[]
}

export interface LegalPageContent {
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
}

export const legalPages = {
  terms: {
    title: "Điều khoản sử dụng",
    description:
      "Quy định chung khi phụ huynh, học viên, gia sư và quản trị viên sử dụng nền tảng Gia Sư Sư Phạm.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Phạm vi dịch vụ",
        items: [
          "Gia Sư Sư Phạm là nền tảng hỗ trợ kết nối nhu cầu học với gia sư phù hợp, quản lý booking, lớp học, thanh toán và phản hồi chất lượng.",
          "Nền tảng có quyền kiểm duyệt hồ sơ, yêu cầu bổ sung thông tin, từ chối hoặc tạm khóa tài khoản khi phát hiện rủi ro an toàn, gian lận hoặc vi phạm chính sách.",
        ],
      },
      {
        heading: "Trách nhiệm người dùng",
        items: [
          "Người dùng phải cung cấp thông tin chính xác, không giả mạo danh tính, không sử dụng nền tảng cho mục đích trái pháp luật.",
          "Phụ huynh, học viên và gia sư cần trao đổi, thanh toán và phản hồi qua các kênh được nền tảng hỗ trợ để hệ thống có đủ dữ liệu xử lý khiếu nại.",
        ],
      },
      {
        heading: "Tài khoản và bảo mật",
        items: [
          "Người dùng chịu trách nhiệm bảo vệ tài khoản, mật khẩu và thông tin đăng nhập của mình.",
          "Nền tảng có thể ghi nhận nhật ký bảo mật, IP, thiết bị, user agent và hành động quan trọng để phục vụ kiểm tra an toàn và vận hành.",
        ],
      },
      {
        heading: "Thanh toán và xử lý tranh chấp",
        items: [
          "Số tiền thanh toán, phí nền tảng, thu nhập gia sư và payout phải được hệ thống backend tính toán và ghi nhận trong ledger.",
          "Khi có tranh chấp, hoàn tiền hoặc vi phạm, nền tảng sẽ đối chiếu booking, session, payment, audit log và bằng chứng liên quan trước khi xử lý.",
        ],
      },
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    description:
      "Cách Gia Sư Sư Phạm thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân, giấy tờ xác minh và dữ liệu học tập.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Dữ liệu được thu thập",
        items: [
          "Thông tin tài khoản, hồ sơ cá nhân, thông tin liên hệ, nhu cầu học, booking, lớp học, session, review, payment và payout.",
          "Với gia sư, hệ thống có thể thu thập giấy tờ định danh, bằng cấp, chứng chỉ, bản cam kết điện tử, IP, user agent, thời điểm ký và hash tài liệu.",
        ],
      },
      {
        heading: "Mục đích sử dụng",
        items: [
          "Dữ liệu được dùng để xác minh gia sư, matching nhu cầu học, vận hành lớp học, xử lý thanh toán, payout, hỗ trợ khách hàng và phòng chống gian lận.",
          "Dữ liệu nhạy cảm không được hiển thị công khai; public profile chỉ hiển thị các badge tin cậy, thông tin dạy học và đánh giá phù hợp.",
        ],
      },
      {
        heading: "Lưu trữ và truy cập",
        items: [
          "File nhạy cảm phải được lưu ở vùng private và chỉ owner hoặc admin có quyền mới được xem qua API có kiểm tra quyền.",
          "Mọi lượt admin xem, tải, duyệt hoặc từ chối tài liệu nhạy cảm cần được ghi audit log kèm actor, resource, lý do, IP, user agent và request id.",
        ],
      },
      {
        heading: "Bảo vệ dữ liệu",
        items: [
          "Hệ thống áp dụng RBAC, kiểm tra ownership, rate limit, structured log không chứa mật khẩu/token và kế hoạch chuyển refresh token sang HttpOnly Secure SameSite cookie.",
          "Dữ liệu backup cần được kiểm soát quyền truy cập và định kỳ kiểm tra khả năng restore.",
        ],
      },
    ],
  },
  refundPolicy: {
    title: "Chính sách hoàn tiền",
    description:
      "Nguyên tắc tiếp nhận, xác minh và xử lý hoàn tiền cho booking, lớp học, buổi học và sự cố thanh toán.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Trường hợp có thể xem xét hoàn tiền",
        items: [
          "Buổi học không diễn ra do lỗi từ gia sư hoặc nền tảng, booking bị hủy hợp lệ trước thời hạn, hoặc payment bị ghi nhận sai sau đối soát.",
          "Các yêu cầu hoàn tiền cần gửi kèm mã booking, mã payment, lý do và bằng chứng liên quan trong thời hạn xử lý được công bố.",
        ],
      },
      {
        heading: "Nguyên tắc xử lý",
        items: [
          "Refund phải đi qua backend, có payment transaction, idempotency key, audit log và điều chỉnh earning ledger nếu payment đã tạo thu nhập cho gia sư.",
          "Admin không được mark refund thủ công nếu thiếu lý do, thiếu quyền hoặc không có kết quả đối soát payment rõ ràng.",
        ],
      },
      {
        heading: "Thời gian xử lý",
        items: [
          "Yêu cầu hợp lệ được phân loại theo mức độ ưu tiên và aging bucket để admin xử lý trong queue reconciliation.",
          "Thời gian tiền về tài khoản phụ thuộc cổng thanh toán, ngân hàng và trạng thái đối soát.",
        ],
      },
    ],
  },
  tutorAgreement: {
    title: "Cam kết gia sư",
    description:
      "Nội dung cam kết điện tử mà gia sư cần đọc, xác nhận và ký trước khi hồ sơ được xét duyệt.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Cam kết thông tin",
        items: [
          "Gia sư cam kết thông tin cá nhân, bằng cấp, chứng chỉ, kinh nghiệm, khu vực dạy, học phí và lịch rảnh là đúng sự thật.",
          "Gia sư đồng ý cung cấp giấy tờ xác minh khi nền tảng yêu cầu và chịu trách nhiệm nếu sử dụng tài liệu giả mạo hoặc tài liệu của người khác.",
        ],
      },
      {
        heading: "Cam kết chất lượng dạy học",
        items: [
          "Gia sư cam kết đúng giờ, chuẩn bị bài, ứng xử chuyên nghiệp, bảo vệ thông tin học viên/phụ huynh và tuân thủ lịch học đã xác nhận.",
          "Gia sư không được gợi ý giao dịch ngoài nền tảng khi việc đó làm mất khả năng hỗ trợ, đối soát hoặc xử lý tranh chấp.",
        ],
      },
      {
        heading: "Cam kết điện tử",
        items: [
          "Bản cam kết điện tử cần lưu agreement version, signed at, IP, user agent, chữ ký xác nhận, thông tin người ký và document hash.",
          "Hồ sơ gia sư không đủ điều kiện duyệt nếu thiếu giấy tờ bắt buộc, chưa ký cam kết hoặc có risk score vượt ngưỡng.",
        ],
      },
    ],
  },
  studentParentPolicy: {
    title: "Chính sách học viên và phụ huynh",
    description:
      "Quy định dành cho người tạo nhu cầu học, đặt lịch, thanh toán, phản hồi và phối hợp xử lý sự cố.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Tạo nhu cầu học",
        items: [
          "Phụ huynh hoặc học viên cần cung cấp môn học, lớp, khu vực, hình thức học, ngân sách, thời gian mong muốn và thông tin liên hệ chính xác.",
          "Nền tảng có thể liên hệ lại để xác minh nhu cầu, bổ sung dữ liệu và cập nhật trạng thái request theo SLA vận hành.",
        ],
      },
      {
        heading: "Booking và lớp học",
        items: [
          "Booking, lịch học, thay đổi lịch, vắng mặt, hủy lịch và review nên được ghi nhận trên hệ thống để bảo vệ quyền lợi các bên.",
          "Người học cần phản hồi kịp thời khi không thể tham gia buổi học để tránh ảnh hưởng đến lịch của gia sư.",
        ],
      },
      {
        heading: "Thanh toán và phản hồi",
        items: [
          "Thanh toán nên được thực hiện qua kênh được nền tảng hỗ trợ để có receipt, đối soát và cơ sở xử lý refund khi cần.",
          "Review phải dựa trên trải nghiệm học thật và không được chứa thông tin cá nhân nhạy cảm, xúc phạm hoặc nội dung sai sự thật.",
        ],
      },
    ],
  },
  complaintPolicy: {
    title: "Chính sách khiếu nại",
    description:
      "Quy trình tiếp nhận, phân loại, xử lý và lưu vết khiếu nại liên quan đến gia sư, học viên, payment, payout và chất lượng dịch vụ.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Tiếp nhận khiếu nại",
        items: [
          "Khiếu nại cần nêu rõ vấn đề, mã request, booking, class, session hoặc payment liên quan và cung cấp bằng chứng nếu có.",
          "Các khiếu nại liên quan an toàn, gian lận, thanh toán hoặc dữ liệu nhạy cảm được ưu tiên trong Today Action Queue.",
        ],
      },
      {
        heading: "Xử lý và audit",
        items: [
          "Admin phải ghi nhận trạng thái xử lý, lý do quyết định, hành động đã thực hiện và audit log cho mọi thao tác quan trọng.",
          "Các hành động như suspend tutor, ẩn review, refund, reject payout hoặc khóa user cần confirm dialog và reason bắt buộc.",
        ],
      },
      {
        heading: "Kết quả xử lý",
        items: [
          "Tùy mức độ, nền tảng có thể nhắc nhở, yêu cầu bổ sung bằng chứng, điều chỉnh lịch, refund, ẩn nội dung vi phạm hoặc tạm khóa tài khoản.",
          "Quyết định xử lý dựa trên dữ liệu hệ thống, audit log, bằng chứng từ các bên và chính sách đang có hiệu lực.",
        ],
      },
    ],
  },
  safety: {
    title: "An toàn và niềm tin",
    description:
      "Cam kết vận hành để phụ huynh, học viên và gia sư sử dụng nền tảng minh bạch, có kiểm duyệt và có khả năng truy vết.",
    updatedAt: "30/05/2026",
    sections: [
      {
        heading: "Xác minh gia sư",
        items: [
          "Gia sư cần hoàn thành hồ sơ, giấy tờ định danh, bằng cấp/chứng chỉ, bản cam kết điện tử và các bước kiểm tra rủi ro trước khi được duyệt.",
          "Public profile chỉ hiển thị các tín hiệu tin cậy phù hợp như đã xác minh, hồ sơ đầy đủ, phản hồi nhanh hoặc được đánh giá cao.",
        ],
      },
      {
        heading: "Bảo vệ giao dịch",
        items: [
          "Payment, refund, earning và payout phải được ghi nhận bằng transaction, webhook event, ledger entry và audit log để hạn chế sai lệch tiền.",
          "Admin có queue đối soát payment pending lâu, webhook lỗi, refund pending và payout chờ duyệt.",
        ],
      },
      {
        heading: "Vận hành có kiểm soát",
        items: [
          "Hệ thống cần request id, error tracking, health check, logging, audit log và cảnh báo khi backend, payment hoặc queue vận hành bất thường.",
          "Người dùng có thể liên hệ hỗ trợ hoặc tạo khiếu nại khi phát hiện hành vi không phù hợp.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalPageContent>
