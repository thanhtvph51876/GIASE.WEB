"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleBadge } from "@/components/platform/operational-components"
import { useAuthContext } from "@/lib/contexts/auth-context"

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuthContext()
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatar, setAvatar] = useState("")

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (user) {
      setFullName(user.fullName)
      setPhone(user.phone)
      setAvatar(user.avatar || "")
    }
  }, [isLoading, router, user])

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="app-container flex-1 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <RoleBadge role={user.role} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Avatar URL</Label><Input value={avatar} onChange={(event) => setAvatar(event.target.value)} /></div>
            <div className="space-y-2"><Label>Họ tên</Label><Input value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={user.email} disabled /></div>
            <div className="space-y-2"><Label>Số điện thoại</Label><Input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
            <Button onClick={() => updateProfile({ fullName, phone, avatar })}>Lưu hồ sơ</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
