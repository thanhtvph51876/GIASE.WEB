import Link from "next/link"
import { GraduationCap, Facebook, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  services: [
    { href: "/tutors", label: "Tìm gia sư" },
    { href: "/learning-requests", label: "Lớp cần gia sư" },
    { href: "/register?role=tutor", label: "Đăng ký làm gia sư" },
    { href: "/register?role=parent", label: "Đăng ký tìm gia sư" },
  ],
  support: [
    { href: "/how-it-works", label: "Quy trình" },
    { href: "/contact", label: "Liên hệ" },
    { href: "/register-student", label: "Đăng ký học" },
    { href: "/register-tutor", label: "Làm gia sư" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/90">
      <div className="app-container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-slate-950">Gia Sư Sư Phạm</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nền tảng kết nối gia sư chất lượng từ các trường Sư phạm với học sinh, 
              phụ huynh trên toàn quốc.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Dịch vụ</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>280 An Dương Vương, Quận 5, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="tel:0123456789"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  0123 456 789
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@giasusupham.vn"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  contact@giasusupham.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200/80 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Gia Sư Sư Phạm. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}
