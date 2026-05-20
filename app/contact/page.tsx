"use client"

import { useState } from "react"
import { Mail, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { contactService } from "@/lib/services"

export default function ContactPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(true)
    const result = await contactService.createContactRequest({ fullName, email, message })
    setIsSubmitting(false)
    if (result.success) {
      toast.success("Đã lưu liên hệ", { description: "Admin có thể xem trong /admin/contacts." })
      setFullName("")
      setEmail("")
      setMessage("")
    } else {
      toast.error(result.error || "Không thể gửi liên hệ")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="page-band py-16 text-center">
          <h1 className="text-4xl font-bold text-slate-950">Liên hệ Gia Sư Sư Phạm</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Đội ngũ tư vấn luôn sẵn sàng hỗ trợ phụ huynh, học sinh và gia sư.</p>
        </section>
        <section className="app-container grid gap-6 py-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            {[{ icon: Mail, label: "Email hỗ trợ", value: "hotro@giasusupham.vn" }, { icon: Phone, label: "Hotline", value: "0901 234 567" }, { icon: MapPin, label: "Địa chỉ", value: "280 An Dương Vương, Quận 5, TP.HCM" }].map((item) => <Card key={item.label}><CardContent className="flex gap-3 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div><div><p className="font-semibold text-slate-900">{item.label}</p><p className="text-sm text-muted-foreground">{item.value}</p></div></CardContent></Card>)}
          </div>
          <Card>
            <CardHeader><CardTitle>Gửi tin nhắn</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Họ tên</Label><Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Văn A" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@example.com" /></div>
              <div className="space-y-2"><Label>Nội dung</Label><Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Bạn cần hỗ trợ điều gì?" /></div>
              <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}</Button>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}
