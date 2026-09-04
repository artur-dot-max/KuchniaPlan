export const organizationRoles = [
  'owner',
  'manager',
  'chef',
  'cook',
  'warehouse',
  'packing',
] as const

export type OrganizationRole = (typeof organizationRoles)[number]

export type Profile = {
  id: string
  displayName: string
  email: string | null
  createdAt: string
  updatedAt: string
}

export type Organization = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type Location = {
  id: string
  organizationId: string
  name: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type OrganizationMembership = {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}
