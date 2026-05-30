import { NextResponse, type NextRequest } from "next/server"

const tutorLegacyRedirects: Record<string, string> = {
  "/tutor": "/dashboard/tutor",
  "/tutor/dashboard": "/dashboard/tutor",
  "/tutor/onboarding": "/dashboard/tutor/verification",
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === "/tutor" || pathname.startsWith("/tutor/")) {
    const targetPath =
      tutorLegacyRedirects[pathname] || pathname.replace(/^\/tutor(?=\/)/, "/dashboard/tutor")
    const targetUrl = request.nextUrl.clone()
    targetUrl.pathname = targetPath
    targetUrl.search = search
    return NextResponse.redirect(targetUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/tutor", "/tutor/:path*"],
}
