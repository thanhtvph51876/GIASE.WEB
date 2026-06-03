import type { Metadata } from "next"

function publicEnv(key: string, fallback: string) {
  const value = process.env[key]
  return value && value.trim() ? value.trim() : fallback
}

const supportPhone = publicEnv("NEXT_PUBLIC_SUPPORT_PHONE", "0901 234 567")
const supportPhoneHref = publicEnv(
  "NEXT_PUBLIC_SUPPORT_PHONE_HREF",
  `tel:${supportPhone.replace(/[^\d+]/g, "")}`
)

export const siteConfig = {
  name: "Gia Sư Sư Phạm",
  siteName: "Gia Sư Sư Phạm",
  title: "Gia Sư Sư Phạm - Kết nối gia sư chất lượng",
  description:
    "Nền tảng kết nối học sinh/phụ huynh với gia sư đã xác minh hồ sơ, minh bạch học phí, lịch học và quy trình học thử.",
  url: publicEnv("NEXT_PUBLIC_SITE_URL", "https://giasusupham.vn"),
  supportEmail: publicEnv("NEXT_PUBLIC_SUPPORT_EMAIL", "hotro@giasusupham.vn"),
  supportPhone,
  supportPhoneHref,
  address: publicEnv("NEXT_PUBLIC_BUSINESS_ADDRESS", "280 An Dương Vương, Quận 5, TP. Hồ Chí Minh"),
  businessAddress: publicEnv("NEXT_PUBLIC_BUSINESS_ADDRESS", "280 An Dương Vương, Quận 5, TP. Hồ Chí Minh"),
  workingHours: publicEnv("NEXT_PUBLIC_WORKING_HOURS", "Thứ 2 - Thứ 7, 08:00 - 20:00"),
  facebookUrl: publicEnv("NEXT_PUBLIC_FACEBOOK_URL", ""),
  ogImage: "/og-image.png",
  socialLinks: [
    {
      label: "Facebook",
      href: publicEnv("NEXT_PUBLIC_FACEBOOK_URL", ""),
    },
  ],
  legalLinks: [
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Chính sách hoàn phí", href: "/refund-policy" },
    { label: "Chính sách khiếu nại", href: "/complaint-policy" },
    { label: "Cam kết gia sư", href: "/tutor-agreement" },
    { label: "Chính sách học sinh/phụ huynh", href: "/student-parent-policy" },
    { label: "An toàn học tập", href: "/safety" },
  ],
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, siteConfig.url).toString()
}

export function pageMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const canonical = absoluteUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.ogImage)],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.supportEmail,
  telephone: siteConfig.supportPhone,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.businessAddress,
    addressLocality: "TP. Hồ Chí Minh",
    addressCountry: "VN",
  },
}
