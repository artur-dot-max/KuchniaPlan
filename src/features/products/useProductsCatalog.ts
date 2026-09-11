import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
  Allergen,
  Product,
  ProductAllergen,
  Supplier,
  Unit,
  UnitKind,
} from '../../domain/products/types'
import type {
  AllergenInput,
  ProductInput,
  SupplierInput,
  UnitInput,
  UpdateProductInput,
} from '../../domain/products/validation'
import {
  allergenSchema,
  productSchema,
  supplierSchema,
  unitSchema,
  updateProductSchema,
} from '../../domain/products/validation'
import { supabase } from '../../lib/supabase'

type ProductsCatalogState = {
  addAllergen: (input: Omit<AllergenInput, 'organizationId'>) => Promise<void>
  addProduct: (input: Omit<ProductInput, 'organizationId'>) => Promise<void>
  addSupplier: (input: Omit<SupplierInput, 'organizationId'>) => Promise<void>
  addUnit: (input: Omit<UnitInput, 'organizationId'>) => Promise<void>
  allergens: Allergen[]
  archiveProduct: (productId: string) => Promise<void>
  error: string | null
  isLoading: boolean
  productAllergens: ProductAllergen[]
  products: Product[]
  refresh: () => Promise<void>
  setProductAllergens: (productId: string, allergenIds: string[]) => Promise<void>
  suppliers: Supplier[]
  updateProduct: (input: Omit<UpdateProductInput, 'organizationId'>) => Promise<void>
  units: Unit[]
}

const mapCatalogError = (message: string) => {
  if (message.includes("Could not find the table 'public.products'")) {
    return 'Brakuje tabel produktów. Uruchom migrację Etapu 3 w Supabase SQL Editor.'
  }

  if (message.includes('violates row-level security policy')) {
    return 'Nie masz uprawnień do tej operacji w wybranej organizacji.'
  }

  return message
}

const mapUnit = (row: Record<string, unknown>): Unit => ({
  archivedAt: row.archived_at as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  kind: row.kind as UnitKind,
  name: row.name as string,
  organizationId: row.organization_id as string,
  symbol: row.symbol as string,
  updatedAt: row.updated_at as string,
})

const mapSupplier = (row: Record<string, unknown>): Supplier => ({
  archivedAt: row.archived_at as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  email: row.email as string | null,
  id: row.id as string,
  name: row.name as string,
  organizationId: row.organization_id as string,
  phone: row.phone as string | null,
  updatedAt: row.updated_at as string,
})

const mapAllergen = (row: Record<string, unknown>): Allergen => ({
  archivedAt: row.archived_at as string | null,
  code: row.code as string | null,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  name: row.name as string,
  organizationId: row.organization_id as string,
  updatedAt: row.updated_at as string,
})

const mapProduct = (row: Record<string, unknown>): Product => ({
  archivedAt: row.archived_at as string | null,
  baseUnitId: row.base_unit_id as string,
  category: row.category as string,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  id: row.id as string,
  initialLossPercent: Number(row.initial_loss_percent),
  isActive: row.is_active as boolean,
  name: row.name as string,
  organizationId: row.organization_id as string,
  purchaseUnitId: row.purchase_unit_id as string | null,
  supplierId: row.supplier_id as string | null,
  thermalLossPercent: Number(row.thermal_loss_percent),
  updatedAt: row.updated_at as string,
})

const mapProductAllergen = (row: Record<string, unknown>): ProductAllergen => ({
  allergenId: row.allergen_id as string,
  createdAt: row.created_at as string,
  createdBy: row.created_by as string | null,
  organizationId: row.organization_id as string,
  productId: row.product_id as string,
})

export function useProductsCatalog(organizationId: string | undefined): ProductsCatalogState {
  const [allergens, setAllergens] = useState<Allergen[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [productAllergens, setProductAllergenRows] = useState<ProductAllergen[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const refresh = useCallback(async () => {
    if (!supabase || !organizationId) {
      return
    }

    setIsLoading(true)
    setError(null)

    const [unitsResult, suppliersResult, allergensResult, productsResult, productAllergensResult] =
      await Promise.all([
        supabase.from('units').select('*').eq('organization_id', organizationId).order('name'),
        supabase.from('suppliers').select('*').eq('organization_id', organizationId).order('name'),
        supabase.from('allergens').select('*').eq('organization_id', organizationId).order('name'),
        supabase.from('products').select('*').eq('organization_id', organizationId).order('name'),
        supabase.from('product_allergens').select('*').eq('organization_id', organizationId),
      ])

    setIsLoading(false)

    const firstError =
      unitsResult.error ??
      suppliersResult.error ??
      allergensResult.error ??
      productsResult.error ??
      productAllergensResult.error ??
      null

    if (firstError) {
      setError(mapCatalogError(firstError.message))
      return
    }

    setUnits((unitsResult.data ?? []).map(mapUnit))
    setSuppliers((suppliersResult.data ?? []).map(mapSupplier))
    setAllergens((allergensResult.data ?? []).map(mapAllergen))
    setProducts((productsResult.data ?? []).map(mapProduct))
    setProductAllergenRows((productAllergensResult.data ?? []).map(mapProductAllergen))
  }, [organizationId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [refresh])

  const addUnit = useCallback(
    async (input: Omit<UnitInput, 'organizationId'>) => {
      if (!supabase || !organizationId) {
        return
      }

      const parsed = unitSchema.parse({ ...input, organizationId })
      setIsLoading(true)
      setError(null)

      const result = await supabase.from('units').insert({
        kind: parsed.kind,
        name: parsed.name,
        organization_id: parsed.organizationId,
        symbol: parsed.symbol,
      })

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const addSupplier = useCallback(
    async (input: Omit<SupplierInput, 'organizationId'>) => {
      if (!supabase || !organizationId) {
        return
      }

      const parsed = supplierSchema.parse({ ...input, organizationId })
      setIsLoading(true)
      setError(null)

      const result = await supabase.from('suppliers').insert({
        email: parsed.email ?? null,
        name: parsed.name,
        organization_id: parsed.organizationId,
        phone: parsed.phone ?? null,
      })

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const addAllergen = useCallback(
    async (input: Omit<AllergenInput, 'organizationId'>) => {
      if (!supabase || !organizationId) {
        return
      }

      const parsed = allergenSchema.parse({ ...input, organizationId })
      setIsLoading(true)
      setError(null)

      const result = await supabase.from('allergens').insert({
        code: parsed.code ?? null,
        name: parsed.name,
        organization_id: parsed.organizationId,
      })

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const addProduct = useCallback(
    async (input: Omit<ProductInput, 'organizationId'>) => {
      if (!supabase || !organizationId) {
        return
      }

      const parsed = productSchema.parse({ ...input, organizationId })
      setIsLoading(true)
      setError(null)

      const result = await supabase.from('products').insert({
        base_unit_id: parsed.baseUnitId,
        category: parsed.category,
        initial_loss_percent: parsed.initialLossPercent,
        name: parsed.name,
        organization_id: parsed.organizationId,
        purchase_unit_id: parsed.purchaseUnitId ?? null,
        supplier_id: parsed.supplierId ?? null,
        thermal_loss_percent: parsed.thermalLossPercent,
      })

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const updateProduct = useCallback(
    async (input: Omit<UpdateProductInput, 'organizationId'>) => {
      if (!supabase || !organizationId) {
        return
      }

      const parsed = updateProductSchema.parse({ ...input, organizationId })
      setIsLoading(true)
      setError(null)

      const result = await supabase
        .from('products')
        .update({
          base_unit_id: parsed.baseUnitId,
          category: parsed.category,
          initial_loss_percent: parsed.initialLossPercent,
          is_active: parsed.isActive,
          name: parsed.name,
          purchase_unit_id: parsed.purchaseUnitId ?? null,
          supplier_id: parsed.supplierId ?? null,
          thermal_loss_percent: parsed.thermalLossPercent,
        })
        .eq('id', parsed.productId)
        .eq('organization_id', parsed.organizationId)

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const archiveProduct = useCallback(
    async (productId: string) => {
      if (!supabase || !organizationId) {
        return
      }

      setIsLoading(true)
      setError(null)

      const result = await supabase
        .from('products')
        .update({
          archived_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', productId)
        .eq('organization_id', organizationId)

      setIsLoading(false)

      if (result.error) {
        setError(mapCatalogError(result.error.message))
        return
      }

      await refresh()
    },
    [organizationId, refresh],
  )

  const setProductAllergens = useCallback(
    async (productId: string, allergenIds: string[]) => {
      if (!supabase || !organizationId) {
        return
      }

      setIsLoading(true)
      setError(null)

      const deleteResult = await supabase
        .from('product_allergens')
        .delete()
        .eq('product_id', productId)
        .eq('organization_id', organizationId)

      if (deleteResult.error) {
        setIsLoading(false)
        setError(mapCatalogError(deleteResult.error.message))
        return
      }

      if (allergenIds.length > 0) {
        const insertResult = await supabase.from('product_allergens').insert(
          allergenIds.map((allergenId) => ({
            allergen_id: allergenId,
            organization_id: organizationId,
            product_id: productId,
          })),
        )

        if (insertResult.error) {
          setIsLoading(false)
          setError(mapCatalogError(insertResult.error.message))
          return
        }
      }

      setIsLoading(false)
      await refresh()
    },
    [organizationId, refresh],
  )

  return useMemo(
    () => ({
      addAllergen,
      addProduct,
      addSupplier,
      addUnit,
      allergens,
      archiveProduct,
      error,
      isLoading,
      productAllergens,
      products,
      refresh,
      setProductAllergens,
      suppliers,
      updateProduct,
      units,
    }),
    [
      addAllergen,
      addProduct,
      addSupplier,
      addUnit,
      allergens,
      archiveProduct,
      error,
      isLoading,
      productAllergens,
      products,
      refresh,
      setProductAllergens,
      suppliers,
      updateProduct,
      units,
    ],
  )
}
