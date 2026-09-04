import { describe, expect, it } from 'vitest'

import { createLocationSchema, createOrganizationSchema, inviteMemberSchema } from './validation'

describe('access validation', () => {
  it('trims and accepts organization names', () => {
    expect(createOrganizationSchema.parse({ name: '  Hotel Morski  ' })).toEqual({
      name: 'Hotel Morski',
    })
  })

  it('rejects invalid locations', () => {
    const result = createLocationSchema.safeParse({
      name: 'K',
      organizationId: 'not-a-uuid',
    })

    expect(result.success).toBe(false)
  })

  it('accepts valid member invitations', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'szef@kuchniaplan.test',
      organizationId: '0a5f5b7d-74d8-4565-a7a1-705a2d7e0dd2',
      role: 'chef',
    })

    expect(result.success).toBe(true)
  })
})
