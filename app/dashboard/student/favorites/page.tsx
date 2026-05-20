"use client"

import { toast } from "sonner"
import Link from "next/link"
import { TutorCard } from "@/components/tutor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/lib/contexts/auth-context"
import { useFavorites } from "@/lib/hooks/use-tutors"

export default function StudentFavoritesPage() {
  const { user } = useAuthContext()
  const { favoriteTutors: tutors, toggleFavorite } = useFavorites(user?.id)

  const remove = async (tutorId: string) => {
    if (!user) return
    await toggleFavorite(tutorId)
    toast.success("Đã bỏ lưu gia sư")
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel border-l-4 border-l-primary p-6">
        <h1 className="text-2xl font-bold text-slate-950">Gia sư đã lưu</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Danh sách gia sư yêu thích được lưu theo tài khoản của bạn.</p>
      </div>
      {tutors.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="space-y-2">
              <TutorCard tutor={tutor} />
              <Button variant="outline" className="w-full" onClick={() => remove(tutor.id)}>
                Bỏ lưu
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Chưa có gia sư đã lưu</CardTitle>
            <CardDescription>Hãy lưu những hồ sơ phù hợp để so sánh và đặt học thử sau.</CardDescription>
          </CardHeader>
          <CardContent className="pb-10 text-center">
            <Button asChild>
              <Link href="/tutors">Tìm gia sư</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
