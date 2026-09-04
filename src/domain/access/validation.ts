import { z } from 'zod'

import { organizationRoles } from './types'

export const organizationNameSchema = z
  .string()
  .trim()
  .min(2, 'Nazwa firmy musi mieć co najmniej 2 znaki.')
  .max(120, 'Nazwa firmy nie może mieć więcej niż 120 znaków.')

export const locationNameSchema = z
  .string()
  .trim()
  .min(2, 'Nazwa lokalizacji musi mieć co najmniej 2 znaki.')
  .max(120, 'Nazwa lokalizacji nie może mieć więcej niż 120 znaków.')

export const organizationRoleSchema = z.enum(organizationRoles)

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
})

export const createLocationSchema = z.object({
  name: locationNameSchema,
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
})

export const inviteMemberSchema = z.object({
  email: z.email('Podaj poprawny adres e-mail.'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  role: organizationRoleSchema,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
