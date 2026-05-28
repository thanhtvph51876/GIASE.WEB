import type {
  CancellationPolicy,
  Certificate,
  EducationLevel,
  GradeLevel,
  Language,
  Location,
  Subject,
  SubjectCategory,
  TeachingModeOption,
} from "@/types"
import { apiRequest } from "./client"

type MasterDataParams = Record<string, string | boolean | undefined>

function normalizeTeachingMode(item: TeachingModeOption): TeachingModeOption {
  const code = (item.code || item.name || "").toUpperCase()
  const value = code === "HYBRID" ? "both" : code.toLowerCase()
  return {
    ...item,
    value,
    label: item.name,
  }
}

export const masterDataApi = {
  locations(params?: MasterDataParams) {
    return apiRequest<Location[]>("/master-data/locations", { params, auth: false })
  },
  subjects(params?: MasterDataParams) {
    return apiRequest<Subject[]>("/master-data/subjects", { params, auth: false })
  },
  subjectCategories(params?: MasterDataParams) {
    return apiRequest<SubjectCategory[]>("/master-data/subject-categories", { params, auth: false })
  },
  educationLevels(params?: MasterDataParams) {
    return apiRequest<EducationLevel[]>("/master-data/education-levels", { params, auth: false })
  },
  grades(params?: MasterDataParams) {
    return apiRequest<GradeLevel[]>("/master-data/grades", { params, auth: false })
  },
  languages(params?: MasterDataParams) {
    return apiRequest<Language[]>("/master-data/languages", { params, auth: false })
  },
  certificates(params?: MasterDataParams) {
    return apiRequest<Certificate[]>("/master-data/certificates", { params, auth: false })
  },
  async teachingModes(params?: MasterDataParams) {
    const items = await apiRequest<TeachingModeOption[]>("/master-data/teaching-modes", { params, auth: false })
    return items.map(normalizeTeachingMode)
  },
  cancellationPolicies(params?: MasterDataParams) {
    return apiRequest<CancellationPolicy[]>("/master-data/cancellation-policies", { params, auth: false })
  },
}
