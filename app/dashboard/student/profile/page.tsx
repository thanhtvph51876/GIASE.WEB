"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { getInitials, getRoleLabel } from "@/lib/helpers"

export default function StudentProfilePage() {
  const { user, updateProfile } = useAuthContext()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [avatar, setAvatar] = useState(user?.avatar || "")

  return (
    <div className="max-w-3xl space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Cập nhật thông tin liên hệ dùng trong các yêu cầu học.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Email đăng nhập được giữ cố định để bảo vệ tài khoản.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="item-row flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-lg font-bold text-primary">
              {avatar ? <img src={avatar} alt={fullName || "Ảnh đại diện"} className="h-full w-full object-cover" /> : getInitials(fullName || user?.email || "U")}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{fullName || "Chưa cập nhật tên"}</p>
              <p className="text-sm text-muted-foreground">{getRoleLabel(user?.role || "student")} · {user?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Họ tên</Label>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Link ảnh đại diện</Label>
            <Input value={avatar} onChange={(event) => setAvatar(event.target.value)} />
          </div>
          <Button onClick={() => updateProfile({ fullName, phone, avatar })}>Lưu thay đổi</Button>
        </CardContent>
      </Card>
    </div>
  )
}
