import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/site-config"

const publicRoutes = [
  "/",
  "/tutors",
  "/learning-requests",
  "/register-student",
  "/register-tutor",
  "/register",
  "/login",
  "/contact",
  "/how-it-works",
  "/process",
  "/about",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/tutor-agreement",
  "/student-parent-policy",
  "/complaint-policy",
  "/safety",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }))
}
