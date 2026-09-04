export const unitKinds = ['mass', 'volume', 'piece', 'package'] as const

export type UnitKind = (typeof unitKinds)[number]

export type Unit = {
  id: string
  organizationId: string
  name: string
  symbol: string
  kind: UnitKind
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type Allergen = {
  id: string
  organizationId: string
  name: string
  code: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type Supplier = {
  id: string
  organizationId: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type Product = {
  id: string
  organizationId: string
  name: string
  category: string
  baseUnitId: string
  purchaseUnitId: string | null
  supplierId: string | null
  initialLossPercent: number
  thermalLossPercent: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type ProductUnitConversion = {
  id: string
  organizationId: string
  productId: string
  fromUnitId: string
  toUnitId: string
  factor: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type ProductPackage = {
  id: string
  organizationId: string
  productId: string
  supplierId: string | null
  unitId: string
  packageSize: number
  label: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}

export type ProductPrice = {
  id: string
  organizationId: string
  productId: string
  supplierId: string | null
  packageId: string | null
  priceNet: number
  currency: 'PLN'
  validFrom: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  archivedAt: string | null
}
