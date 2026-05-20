"use client"

import {
  Calculator,
  BookOpen,
  Languages,
  Atom,
  FlaskConical,
  Leaf,
  Laptop,
  GraduationCap,
  Landmark,
  Globe,
  Palette,
  Music,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  calculator: Calculator,
  "book-open": BookOpen,
  languages: Languages,
  atom: Atom,
  "flask-conical": FlaskConical,
  leaf: Leaf,
  laptop: Laptop,
  "graduation-cap": GraduationCap,
  landmark: Landmark,
  globe: Globe,
  palette: Palette,
  music: Music,
}

export function getSubjectIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || BookOpen
}

export function SubjectIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = getSubjectIcon(name)
  return <Icon className={className} />
}
