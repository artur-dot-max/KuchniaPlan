import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Location, Organization, OrganizationMembership } from '../../domain/access/types'
import { supabase } from '../../lib/supabase'

type OrganizationContextState = {
  createWorkspace: (input: { locationName: string; organizationName: string }) => Promise<void>
  error: string | null
  isLoading: boolean
  locations: Location[]
  memberships: OrganizationMembership[]
  organizations: Organization[]
  refresh: () => Promise<void>
  selectedLocation: Location | null
  selectedOrganization: Organization | null
  setSelectedLocationId: (id: string) => void
  setSelectedOrganizationId: (id: string) => void
}

const mapOrganization = (row: Record<string, unknown>): Organization => ({
  archivedAt: row.archived_at as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  name: row.name as string,
  updatedAt: row.updated_at as string,
})

const mapLocation = (row: Record<string, unknown>): Location => ({
  archivedAt: row.archived_at as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  name: row.name as string,
  organizationId: row.organization_id as string,
  updatedAt: row.updated_at as string,
})

const mapMembership = (row: Record<string, unknown>): OrganizationMembership => ({
  archivedAt: row.archived_at as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  organizationId: row.organization_id as string,
  role: row.role as OrganizationMembership['role'],
  updatedAt: row.updated_at as string,
  userId: row.user_id as string,
})

const mapWorkspaceError = (message: string) => {
  if (message.includes("Could not find the table 'public.organizations'")) {
    return 'Brakuje tabel Supabase. Uruchom migrację z katalogu supabase/migrations w SQL Editor projektu.'
  }

  return message
}

export function useOrganizationContext(userId: string | undefined): OrganizationContextState {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      return
    }

    setIsLoading(true)
    setError(null)

    const [organizationsResult, locationsResult, membershipsResult] = await Promise.all([
      supabase.from('organizations').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('organization_memberships').select('*').eq('user_id', userId),
    ])

    setIsLoading(false)

    const firstError =
      organizationsResult.error ?? locationsResult.error ?? membershipsResult.error ?? null

    if (firstError) {
      setError(mapWorkspaceError(firstError.message))
      return
    }

    const nextOrganizations = (organizationsResult.data ?? []).map(mapOrganization)
    const nextLocations = (locationsResult.data ?? []).map(mapLocation)
    const nextMemberships = (membershipsResult.data ?? []).map(mapMembership)

    setOrganizations(nextOrganizations)
    setLocations(nextLocations)
    setMemberships(nextMemberships)
    setSelectedOrganizationId((current) => current || nextOrganizations[0]?.id || '')
    setSelectedLocationId((current) => current || nextLocations[0]?.id || '')
  }, [userId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [refresh])

  const createWorkspace = useCallback(
    async (input: { locationName: string; organizationName: string }) => {
      if (!supabase || !userId) {
        return
      }

      setIsLoading(true)
      setError(null)

      const organizationResult = await supabase
        .from('organizations')
        .insert({ name: input.organizationName })
        .select('*')
        .single()

      if (organizationResult.error || !organizationResult.data) {
        setIsLoading(false)
        setError(
          mapWorkspaceError(
            organizationResult.error?.message ?? 'Nie udało się utworzyć organizacji.',
          ),
        )
        return
      }

      const organization = mapOrganization(organizationResult.data)

      const membershipResult = await supabase.from('organization_memberships').insert({
        organization_id: organization.id,
        role: 'owner',
        user_id: userId,
      })

      if (membershipResult.error) {
        setIsLoading(false)
        setError(mapWorkspaceError(membershipResult.error.message))
        return
      }

      const locationResult = await supabase
        .from('locations')
        .insert({
          name: input.locationName,
          organization_id: organization.id,
        })
        .select('*')
        .single()

      if (locationResult.error || !locationResult.data) {
        setIsLoading(false)
        setError(
          mapWorkspaceError(locationResult.error?.message ?? 'Nie udało się utworzyć lokalizacji.'),
        )
        return
      }

      setSelectedOrganizationId(organization.id)
      setSelectedLocationId(locationResult.data.id as string)
      await refresh()
    },
    [refresh, userId],
  )

  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === selectedOrganizationId) ?? null,
    [organizations, selectedOrganizationId],
  )

  const organizationLocations = useMemo(
    () =>
      locations.filter((location) =>
        selectedOrganization ? location.organizationId === selectedOrganization.id : true,
      ),
    [locations, selectedOrganization],
  )

  const selectedLocation = useMemo(
    () => organizationLocations.find((location) => location.id === selectedLocationId) ?? null,
    [organizationLocations, selectedLocationId],
  )

  return {
    createWorkspace,
    error,
    isLoading,
    locations: organizationLocations,
    memberships,
    organizations,
    refresh,
    selectedLocation,
    selectedOrganization,
    setSelectedLocationId,
    setSelectedOrganizationId,
  }
}
