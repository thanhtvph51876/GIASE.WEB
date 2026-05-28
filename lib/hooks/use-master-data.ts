"use client"

import useSWR from "swr"
import { masterDataService } from "@/lib/services/master-data-service"

export function useMasterDataCatalog() {
  const { data, error, isLoading, mutate } = useSWR(
    "master-data-catalog",
    async () => {
      const [subjects, grades, locations, teachingModes, certificates] = await Promise.all([
        masterDataService.getSubjects(),
        masterDataService.getGrades(),
        masterDataService.getLocations(),
        masterDataService.getTeachingModes(),
        masterDataService.getCertificates(),
      ])
      return { subjects, grades, locations, teachingModes, certificates }
    },
    { revalidateOnFocus: false }
  )

  return {
    subjects: data?.subjects,
    grades: data?.grades,
    locations: data?.locations,
    teachingModes: data?.teachingModes,
    certificates: data?.certificates,
    error,
    isLoading,
    refresh: mutate,
  }
}
