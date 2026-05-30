"use client"

import Link from "next/link"
import { Star, MapPin, GraduationCap, CheckCircle, Clock, CalendarDays, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Tutor } from "@/types"
import { formatCurrency } from "@/lib/helpers/format-helpers"

interface TutorCardProps {
  tutor: Tutor
  variant?: "default" | "compact"
}

export function TutorCard({ tutor, variant = "default" }: TutorCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(-2)
      .toUpperCase()
  }

  const getVerificationBadge = () => {
    if (tutor.verified && tutor.approvalStatus === "approved") {
      return (
        <Badge variant="secondary" className="gap-1 rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle className="h-3 w-3" />
          Đã xác minh
        </Badge>
      )
    }
    if (tutor.approvalStatus === "pending") {
      return (
        <Badge variant="secondary" className="gap-1 rounded-full">
          <Clock className="h-3 w-3" />
          Chờ xác minh
        </Badge>
      )
    }
    return null
  }

  if (variant === "compact") {
    return (
      <Card className="reveal glass-card gradient-border-hover premium-hover-lift overflow-hidden rounded-2xl">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12 border-2 border-white ring-2 ring-emerald-100">
              <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
              <AvatarFallback>{getInitials(tutor.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{tutor.fullName}</h3>
                {tutor.verified && tutor.approvalStatus === "approved" && (
                  <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {tutor.subjects.slice(0, 2).join(", ")}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{tutor.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({tutor.reviewCount} đánh giá)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="reveal glass-card gradient-border-hover premium-hover-lift group overflow-hidden rounded-2xl">
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-600 to-emerald-500" />
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar className="icon-float h-20 w-20 shrink-0 border-4 border-white shadow-sm ring-2 ring-emerald-100">
            <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
            <AvatarFallback className="text-lg">{getInitials(tutor.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Link href={`/tutors/${tutor.id}`}>
                <h3 className="font-heading text-lg font-semibold hover:text-primary">{tutor.fullName}</h3>
              </Link>
              {getVerificationBadge()}
            </div>

            <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>
                {tutor.university} - {tutor.major}
              </span>
            </div>

            {tutor.locations.length > 0 && (
              <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {tutor.locations.slice(0, 2).join(", ")}
                  {tutor.locations.length > 2 && ` +${tutor.locations.length - 2}`}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 4).map((subject) => (
                  <Badge key={subject} variant="secondary" className="rounded-full bg-emerald-50 text-xs text-emerald-800">
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.subjects.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/60 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{tutor.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({tutor.reviewCount} đánh giá)
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {tutor.totalClasses} buổi
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {tutor.responseRate}% phản hồi
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(tutor.pricePerHour)}
            </span>
            <span className="text-sm text-muted-foreground">/giờ</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t border-white/60 bg-white/50 p-4">
        <Button variant="outline" className="flex-1 rounded-full" asChild>
          <Link href={`/tutors/${tutor.id}`}>Xem hồ sơ</Link>
        </Button>
        <Button className="flex-1 rounded-full whitespace-normal px-2 text-xs sm:text-sm" asChild>
          <Link href={`/tutors/${tutor.id}/booking`}>Đăng ký học thử</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
