"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Loader2, Mail, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ErrorState, FormFieldError } from "@/components/platform/operational-components"
import { contactService } from "@/lib/services"
import { siteConfig } from "@/lib/site-config"

const contactItems = [
  { icon: Mail, label: "Email hỗ trợ", value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
  { icon: Phone, label: "Hotline", value: siteConfig.supportPhone, href: siteConfig.supportPhoneHref },
  { icon: MapPin, label: "Địa chỉ", value: siteConfig.businessAddress },
]

type ContactPayload = {
  fullName: string
  email: string
  phone?: string
  message: string
}

type ContactFormErrors = Partial<Record<keyof ContactPayload, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^(0|\+84)[0-9]{9}$/

export function ContactPageClient() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [lastPayload, setLastPayload] = useState<ContactPayload | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildPayload = (): ContactPayload => ({
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim() || undefined,
    message: message.trim(),
  })

  const validate = (payload: ContactPayload) => {
    const nextErrors: ContactFormErrors = {}
    if (payload.fullName.length < 2) nextErrors.fullName = "Vui lòng nhập họ tên tối thiểu 2 ký tự."
    if (!emailPattern.test(payload.email)) nextErrors.email = "Email không hợp lệ."
    if (payload.phone && !phonePattern.test(payload.phone)) nextErrors.phone = "Số điện thoại không hợp lệ."
    if (payload.message.length < 10) nextErrors.message = "Nội dung cần tối thiểu 10 ký tự."
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitPayload = async (payload: ContactPayload) => {
    setIsSubmitting(true)
    setSubmitError("")
    setLastPayload(payload)
    const result = await contactService.createContactRequest(payload)
    setIsSubmitting(false)
    if (result.success) {
      toast.success("Đã gửi liên hệ", { description: "Đội ngũ tư vấn sẽ phản hồi theo thông tin bạn cung cấp." })
      setFullName("")
      setEmail("")
      setPhone("")
      setMessage("")
      setLastPayload(null)
      setErrors({})
    } else {
      const errorMessage = result.error || "Không thể gửi liên hệ. Vui lòng thử lại."
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = buildPayload()
    if (!validate(payload)) return
    await submitPayload(payload)
  }

  return (
    <div className="premium-page-bg flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-mesh py-16 text-center">
          <div className="app-container">
            <h1 className="font-heading text-4xl font-bold text-slate-950">Liên hệ {siteConfig.name}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Đội ngũ tư vấn luôn sẵn sàng hỗ trợ phụ huynh, học sinh và gia sư trong giờ làm việc.
            </p>
          </div>
        </section>
        <section className="app-container grid gap-6 py-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {contactItems.map((item) => {
              const content = (
                <Card className="glass-card rounded-2xl">
                  <CardContent className="flex gap-3 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              )
              return item.href ? (
                <a key={item.label} href={item.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              )
            })}
            <Card className="glass-card rounded-2xl">
              <CardContent className="p-5">
                <p className="font-semibold text-slate-900">Giờ hỗ trợ</p>
                <p className="mt-1 text-sm text-muted-foreground">{siteConfig.workingHours}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="glass-card-strong rounded-2xl">
            <CardHeader>
              <CardTitle>Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-full-name">Họ tên</Label>
                  <Input
                    id="contact-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  <FormFieldError message={errors.fullName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Số điện thoại</Label>
                  <Input
                    id="contact-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0901234567"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  <FormFieldError message={errors.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="email@example.com"
                  aria-invalid={Boolean(errors.email)}
                />
                <FormFieldError message={errors.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Nội dung</Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Bạn cần hỗ trợ điều gì?"
                  aria-invalid={Boolean(errors.message)}
                />
                <FormFieldError message={errors.message} />
              </div>
              {submitError && (
                <ErrorState
                  message={submitError}
                  onRetry={lastPayload ? () => submitPayload(lastPayload) : undefined}
                />
              )}
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                Thông tin của bạn chỉ dùng để tư vấn và xếp lớp. Chúng tôi không công khai số điện thoại của bạn.
              </p>
              <Button type="submit" className="rounded-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
              </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}
