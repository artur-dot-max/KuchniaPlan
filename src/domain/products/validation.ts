import { z } from 'zod'

import { unitKinds } from './types'

const percentSchema = z
  .number()
  .min(0, 'Strata nie może być mniejsza niż 0%.')
  .max(95, 'Strata nie może być większa niż 95%.')

const positiveAmountSchema = z.number().positive('Wartość musi być większa od zera.')

export const unitSchema = z.object({
  kind: z.enum(unitKinds),
  name: z
    .string()
    .trim()
    .min(1, 'Nazwa jednostki jest wymagana.')
    .max(80, 'Nazwa jednostki nie może mieć więcej niż 80 znaków.'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  symbol: z
    .string()
    .trim()
    .min(1, 'Symbol jednostki jest wymagany.')
    .max(16, 'Symbol jednostki nie może mieć więcej niż 16 znaków.'),
})

export const supplierSchema = z.object({
  email: z.email('Podaj poprawny adres e-mail.').nullable().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Nazwa dostawcy musi mieć co najmniej 2 znaki.')
    .max(120, 'Nazwa dostawcy nie może mieć więcej niż 120 znaków.'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  phone: z
    .string()
    .trim()
    .max(40, 'Telefon nie może mieć więcej niż 40 znaków.')
    .nullable()
    .optional(),
})

export const productSchema = z.object({
  baseUnitId: z.uuid('Wybierz jednostkę bazową.'),
  category: z
    .string()
    .trim()
    .min(2, 'Kategoria musi mieć co najmniej 2 znaki.')
    .max(80, 'Kategoria nie może mieć więcej niż 80 znaków.'),
  initialLossPercent: percentSchema.default(0),
  name: z
    .string()
    .trim()
    .min(2, 'Nazwa produktu musi mieć co najmniej 2 znaki.')
    .max(160, 'Nazwa produktu nie może mieć więcej niż 160 znaków.'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  purchaseUnitId: z.uuid('Wybierz jednostkę zakupu.').nullable().optional(),
  supplierId: z.uuid('Wybierz dostawcę.').nullable().optional(),
  thermalLossPercent: percentSchema.default(0),
})

export const productPackageSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, 'Nazwa opakowania musi mieć co najmniej 2 znaki.')
    .max(120, 'Nazwa opakowania nie może mieć więcej niż 120 znaków.'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  packageSize: positiveAmountSchema,
  productId: z.uuid('Nieprawidłowy identyfikator produktu.'),
  supplierId: z.uuid('Wybierz dostawcę.').nullable().optional(),
  unitId: z.uuid('Wybierz jednostkę opakowania.'),
})

export const productPriceSchema = z.object({
  currency: z.literal('PLN').default('PLN'),
  organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
  packageId: z.uuid('Nieprawidłowy identyfikator opakowania.').nullable().optional(),
  priceNet: positiveAmountSchema,
  productId: z.uuid('Nieprawidłowy identyfikator produktu.'),
  supplierId: z.uuid('Wybierz dostawcę.').nullable().optional(),
  validFrom: z.iso.date('Podaj datę obowiązywania ceny.'),
})

export const unitConversionSchema = z
  .object({
    factor: positiveAmountSchema,
    fromUnitId: z.uuid('Wybierz jednostkę źródłową.'),
    organizationId: z.uuid('Nieprawidłowy identyfikator firmy.'),
    productId: z.uuid('Nieprawidłowy identyfikator produktu.'),
    toUnitId: z.uuid('Wybierz jednostkę docelową.'),
  })
  .refine((value) => value.fromUnitId !== value.toUnitId, {
    message: 'Jednostki przelicznika muszą być różne.',
    path: ['toUnitId'],
  })

export type ProductInput = z.infer<typeof productSchema>
export type ProductPackageInput = z.infer<typeof productPackageSchema>
export type ProductPriceInput = z.infer<typeof productPriceSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
export type UnitConversionInput = z.infer<typeof unitConversionSchema>
export type UnitInput = z.infer<typeof unitSchema>
