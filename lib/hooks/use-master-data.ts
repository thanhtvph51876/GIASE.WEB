"use client"

import useSWR from "swr"
import { masterDataService } from "@/lib/services/master-data-service"
import { fallbackMasterDataCatalog, retryGet, withPublicTimeout } from "@/lib/public-data"

type MasterDataCatalog = typeof fallbackMasterDataCatalog & {
  failedKeys: string[]
  partialError?: Error
}

async function loadMasterDataCatalog(): Promise<MasterDataCatalog> {
  const [subjects, grades, locations, teachingModes, certificates] = await Promise.allSettled([
    retryGet(() => withPublicTimeout(masterDataService.getSubjects(), "Danh mục môn học")),
    retryGet(() => withPublicTimeout(masterDataService.getGrades(), "Danh mục lớp học")),
    retryGet(() => withPublicTimeout(masterDataService.getLocations(), "Danh mục khu vực")),
    retryGet(() => withPublicTimeout(masterDataService.getTeachingModes(), "Danh mục hình thức học")),
    retryGet(() => withPublicTimeout(masterDataService.getCertificates(), "Danh mục chứng chỉ")),
  ])

  const failedKeys: string[] = []
  const catalog = { ...fallbackMasterDataCatalog }

  if (subjects.status === "fulfilled" && subjects.value.length > 0) catalog.subjects = subjects.value
  else failedKeys.push("subjects")
  if (grades.status === "fulfilled" && grades.value.length > 0) catalog.grades = grades.value
  else failedKeys.push("grades")
  if (locations.status === "fulfilled" && locations.value.length > 0) catalog.locations = locations.value
  else failedKeys.push("locations")
  if (teachingModes.status === "fulfilled" && teachingModes.value.length > 0) catalog.teachingModes = teachingModes.value
  else failedKeys.push("teachingModes")
  if (certificates.status === "fulfilled" && certificates.value.length > 0) catalog.certificates = certificates.value
  else failedKeys.push("certificates")

  return {
    ...catalog,
    failedKeys,
    partialError: failedKeys.length
      ? new Error("Một số danh mục đang dùng dữ liệu dự phòng vì backend chưa phản hồi.")
      : undefined,
  }
}

export function useMasterDataCatalog() {
  const { data, error, isLoading, mutate } = useSWR(
    "master-data-catalog",
    loadMasterDataCatalog,
    { revalidateOnFocus: false }
  )

  return {
    subjects: data?.subjects || fallbackMasterDataCatalog.subjects,
    grades: data?.grades || fallbackMasterDataCatalog.grades,
    locations: data?.locations || fallbackMasterDataCatalog.locations,
    teachingModes: data?.teachingModes || fallbackMasterDataCatalog.teachingModes,
    certificates: data?.certificates || fallbackMasterDataCatalog.certificates,
    error: data?.partialError || error,
    failedKeys: data?.failedKeys || [],
    isFallback: Boolean(data?.failedKeys.length),
    isLoading,
    refresh: mutate,
  }
}
