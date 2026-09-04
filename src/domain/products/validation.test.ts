import { describe, expect, it } from 'vitest'

import { productSchema, unitConversionSchema, unitSchema } from './validation'

const organizationId = '0a5f5b7d-74d8-4565-a7a1-705a2d7e0dd2'
const unitId = 'eeb8ee8f-a1b8-466a-b108-cd9f471339c7'
const secondUnitId = '44748a6b-e2b6-4c0d-9313-c8d3d88a838c'

describe('product validation', () => {
  it('accepts a mass unit', () => {
    const result = unitSchema.parse({
      kind: 'mass',
      name: 'Gram',
      organizationId,
      symbol: 'g',
    })

    expect(result.symbol).toBe('g')
  })

  it('rejects product loss above operational limits', () => {
    const result = productSchema.safeParse({
      baseUnitId: unitId,
      category: 'Mięso',
      initialLossPercent: 99,
      name: 'Pierś z kurczaka',
      organizationId,
      thermalLossPercent: 0,
    })

    expect(result.success).toBe(false)
  })

  it('rejects unit conversion to the same unit', () => {
    const result = unitConversionSchema.safeParse({
      factor: 1,
      fromUnitId: unitId,
      organizationId,
      productId: secondUnitId,
      toUnitId: unitId,
    })

    expect(result.success).toBe(false)
  })
})
