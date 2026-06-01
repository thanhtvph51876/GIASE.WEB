import { masterDataApi } from "@/lib/api/master-data-api"

class MasterDataService {
  getLocations(parentId?: string) {
    return masterDataApi.locations(parentId ? { parentId } : undefined)
  }

  getProvinces() {
    return masterDataApi.locations({ type: "PROVINCE" })
  }

  getSubjects() {
    return masterDataApi.subjects()
  }

  getSubjectCategories() {
    return masterDataApi.subjectCategories()
  }

  getEducationLevels() {
    return masterDataApi.educationLevels()
  }

  getGrades() {
    return masterDataApi.grades()
  }

  getLanguages() {
    return masterDataApi.languages()
  }

  getCertificates() {
    return masterDataApi.certificates()
  }

  getTeachingModes() {
    return masterDataApi.teachingModes()
  }

  getCancellationPolicies() {
    return masterDataApi.cancellationPolicies()
  }

  async createAdminItem(kind: "subjects" | "locations" | "certificates", data: unknown) {
    return masterDataApi.adminCreate(kind, data)
  }

  async updateAdminItem(kind: "subjects" | "locations" | "certificates", id: string, data: unknown) {
    return masterDataApi.adminUpdate(kind, id, data)
  }

  async deleteAdminItem(kind: "subjects" | "locations" | "certificates", id: string) {
    return masterDataApi.adminDelete(kind, id)
  }
}

export const masterDataService = new MasterDataService()
