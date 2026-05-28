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
}

export const masterDataService = new MasterDataService()
