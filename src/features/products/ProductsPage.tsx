import type { FormEvent } from 'react'
import { useState } from 'react'

import type { Product, UnitKind } from '../../domain/products/types'
import { useProductsCatalog } from './useProductsCatalog'

type ProductsPageProps = {
  organizationId: string
}

const unitKindLabels: Record<UnitKind, string> = {
  mass: 'masa',
  package: 'opakowanie',
  piece: 'sztuki',
  volume: 'objętość',
}

export function ProductsPage({ organizationId }: ProductsPageProps) {
  const catalog = useProductsCatalog(organizationId)
  const [activePanel, setActivePanel] = useState<'product' | 'dictionaries'>('product')
  const [activeDictionary, setActiveDictionary] = useState<'units' | 'suppliers' | 'allergens'>(
    'units',
  )
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('Surowce')
  const [baseUnitId, setBaseUnitId] = useState('')
  const [purchaseUnitId, setPurchaseUnitId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [initialLossPercent, setInitialLossPercent] = useState('0')
  const [thermalLossPercent, setThermalLossPercent] = useState('0')
  const [unitName, setUnitName] = useState('')
  const [unitSymbol, setUnitSymbol] = useState('')
  const [unitKind, setUnitKind] = useState<UnitKind>('mass')
  const [supplierName, setSupplierName] = useState('')
  const [allergenName, setAllergenName] = useState('')
  const [allergenCode, setAllergenCode] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const effectiveBaseUnitId = baseUnitId || catalog.units[0]?.id || ''
  const selectedProduct =
    catalog.products.find((product) => product.id === selectedProductId) ?? null

  async function handleAddUnit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    try {
      await catalog.addUnit({
        kind: unitKind,
        name: unitName,
        symbol: unitSymbol,
      })
      setUnitName('')
      setUnitSymbol('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nie udało się dodać jednostki.')
    }
  }

  async function handleAddSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    try {
      await catalog.addSupplier({
        name: supplierName,
      })
      setSupplierName('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nie udało się dodać dostawcy.')
    }
  }

  async function handleAddAllergen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    try {
      await catalog.addAllergen({
        code: allergenCode || null,
        name: allergenName,
      })
      setAllergenName('')
      setAllergenCode('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nie udało się dodać alergenu.')
    }
  }

  async function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    try {
      await catalog.addProduct({
        baseUnitId: effectiveBaseUnitId,
        category,
        initialLossPercent: Number(initialLossPercent),
        name: productName,
        purchaseUnitId: purchaseUnitId || null,
        supplierId: supplierId || null,
        thermalLossPercent: Number(thermalLossPercent),
      })
      setProductName('')
      setInitialLossPercent('0')
      setThermalLossPercent('0')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nie udało się dodać produktu.')
    }
  }

  async function handleUpdateProduct(event: FormEvent<HTMLFormElement>, product: Product) {
    event.preventDefault()
    setLocalError(null)

    const formData = new FormData(event.currentTarget)
    const nextAllergenIds = formData.getAll('allergenIds').map(String)

    try {
      await catalog.updateProduct({
        baseUnitId: String(formData.get('baseUnitId') ?? product.baseUnitId),
        category: String(formData.get('category') ?? product.category),
        initialLossPercent: Number(
          formData.get('initialLossPercent') ?? product.initialLossPercent,
        ),
        isActive: formData.get('isActive') === 'on',
        name: String(formData.get('name') ?? product.name),
        productId: product.id,
        purchaseUnitId: String(formData.get('purchaseUnitId') || '') || null,
        supplierId: String(formData.get('supplierId') || '') || null,
        thermalLossPercent: Number(
          formData.get('thermalLossPercent') ?? product.thermalLossPercent,
        ),
      })
      await catalog.setProductAllergens(product.id, nextAllergenIds)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nie udało się zapisać produktu.')
    }
  }

  async function handleArchiveProduct(product: Product) {
    const confirmed = window.confirm(`Zarchiwizować produkt „${product.name}”?`)

    if (!confirmed) {
      return
    }

    setLocalError(null)

    try {
      await catalog.archiveProduct(product.id)
      setSelectedProductId('')
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Nie udało się zarchiwizować produktu.',
      )
    }
  }

  return (
    <div className="screen-stack">
      <section className="toolbar-band" aria-labelledby="products-heading">
        <div>
          <p className="eyebrow">Etap 3</p>
          <h1 id="products-heading">Produkty</h1>
          <p className="page-lead">
            Katalog surowców i podstawowych strat technologicznych. Jednostki oraz dostawcy są
            wspólnymi słownikami organizacji.
          </p>
        </div>
      </section>

      <div className="section-tabs" role="tablist" aria-label="Widok produktów">
        <button
          aria-selected={activePanel === 'product'}
          className={activePanel === 'product' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActivePanel('product')}
          role="tab"
          type="button"
        >
          Produkty
        </button>
        <button
          aria-selected={activePanel === 'dictionaries'}
          className={activePanel === 'dictionaries' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActivePanel('dictionaries')}
          role="tab"
          type="button"
        >
          Słowniki
        </button>
      </div>

      {catalog.isLoading ? <p className="page-lead page-status">Ładuję katalog...</p> : null}
      {catalog.error ? <p className="form-message page-status">{catalog.error}</p> : null}
      {localError ? <p className="form-message page-status">{localError}</p> : null}

      {activePanel === 'product' ? (
        <section className="content-grid content-grid--wide">
          <article className="panel">
            <div className="panel-header">
              <h2>Lista produktów</h2>
              <span className="status-pill status-pill--info">
                {catalog.products.length} pozycji
              </span>
            </div>

            <div className="data-table" role="table" aria-label="Produkty">
              <div className="data-row data-row--head" role="row">
                <span role="columnheader">Nazwa</span>
                <span role="columnheader">Kategoria</span>
                <span role="columnheader">Jednostka</span>
                <span role="columnheader">Straty</span>
              </div>
              {catalog.products.map((product) => {
                const unit = catalog.units.find((item) => item.id === product.baseUnitId)

                return (
                  <div className="data-row" key={product.id} role="row">
                    <strong role="cell">{product.name}</strong>
                    <span role="cell">{product.category}</span>
                    <span role="cell">{unit?.symbol ?? 'brak'}</span>
                    <span className="data-actions" role="cell">
                      {product.initialLossPercent}% / {product.thermalLossPercent}%
                      <button
                        className="text-action"
                        onClick={() => setSelectedProductId(product.id)}
                        type="button"
                      >
                        Edytuj
                      </button>
                    </span>
                  </div>
                )
              })}
              {catalog.products.length === 0 && !catalog.isLoading ? (
                <p className="empty-state">Brak produktów w wybranej organizacji.</p>
              ) : null}
            </div>
          </article>

          <article className="panel">
            <h2>{selectedProduct ? 'Karta produktu' : 'Dodaj produkt'}</h2>
            {selectedProduct ? (
              <form
                className="form-stack compact-form"
                key={selectedProduct.id}
                onSubmit={(event) => handleUpdateProduct(event, selectedProduct)}
              >
                <label>
                  Nazwa
                  <input defaultValue={selectedProduct.name} name="name" required />
                </label>
                <label>
                  Kategoria
                  <input defaultValue={selectedProduct.category} name="category" required />
                </label>
                <label>
                  Jednostka bazowa
                  <select defaultValue={selectedProduct.baseUnitId} name="baseUnitId" required>
                    {catalog.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Jednostka zakupu
                  <select defaultValue={selectedProduct.purchaseUnitId ?? ''} name="purchaseUnitId">
                    <option value="">Jak bazowa</option>
                    {catalog.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Dostawca
                  <select defaultValue={selectedProduct.supplierId ?? ''} name="supplierId">
                    <option value="">Brak</option>
                    {catalog.suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-pair">
                  <label>
                    Strata wstępna %
                    <input
                      defaultValue={selectedProduct.initialLossPercent}
                      max="95"
                      min="0"
                      name="initialLossPercent"
                      required
                      type="number"
                    />
                  </label>
                  <label>
                    Strata termiczna %
                    <input
                      defaultValue={selectedProduct.thermalLossPercent}
                      max="95"
                      min="0"
                      name="thermalLossPercent"
                      required
                      type="number"
                    />
                  </label>
                </div>
                <label className="checkbox-field">
                  <input
                    defaultChecked={selectedProduct.isActive}
                    name="isActive"
                    type="checkbox"
                  />
                  Produkt aktywny
                </label>
                <fieldset className="checkbox-group">
                  <legend>Alergeny</legend>
                  {catalog.allergens.map((allergen) => {
                    const checked = catalog.productAllergens.some(
                      (item) =>
                        item.productId === selectedProduct.id && item.allergenId === allergen.id,
                    )

                    return (
                      <label className="checkbox-field" key={allergen.id}>
                        <input
                          defaultChecked={checked}
                          name="allergenIds"
                          type="checkbox"
                          value={allergen.id}
                        />
                        {allergen.name}
                      </label>
                    )
                  })}
                  {catalog.allergens.length === 0 ? (
                    <p className="empty-state">Alergeny dodasz w zakładce Słowniki.</p>
                  ) : null}
                </fieldset>
                <div className="button-row">
                  <button className="primary-action" disabled={catalog.isLoading} type="submit">
                    Zapisz produkt
                  </button>
                  <button
                    className="secondary-action"
                    onClick={() => setSelectedProductId('')}
                    type="button"
                  >
                    Zamknij
                  </button>
                </div>
                <button
                  className="danger-action"
                  disabled={catalog.isLoading}
                  onClick={() => handleArchiveProduct(selectedProduct)}
                  type="button"
                >
                  Archiwizuj produkt
                </button>
              </form>
            ) : (
              <form className="form-stack compact-form" onSubmit={handleAddProduct}>
                <label>
                  Nazwa
                  <input
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="Pierś z kurczaka"
                    required
                    value={productName}
                  />
                </label>
                <label>
                  Kategoria
                  <input
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    value={category}
                  />
                </label>
                <label>
                  Jednostka bazowa
                  <select
                    disabled={catalog.units.length === 0}
                    onChange={(event) => setBaseUnitId(event.target.value)}
                    required
                    value={effectiveBaseUnitId}
                  >
                    {catalog.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Jednostka zakupu
                  <select
                    disabled={catalog.units.length === 0}
                    onChange={(event) => setPurchaseUnitId(event.target.value)}
                    value={purchaseUnitId}
                  >
                    <option value="">Jak bazowa</option>
                    {catalog.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Dostawca
                  <select
                    onChange={(event) => setSupplierId(event.target.value)}
                    value={supplierId}
                  >
                    <option value="">Brak</option>
                    {catalog.suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-pair">
                  <label>
                    Strata wstępna %
                    <input
                      max="95"
                      min="0"
                      onChange={(event) => setInitialLossPercent(event.target.value)}
                      required
                      type="number"
                      value={initialLossPercent}
                    />
                  </label>
                  <label>
                    Strata termiczna %
                    <input
                      max="95"
                      min="0"
                      onChange={(event) => setThermalLossPercent(event.target.value)}
                      required
                      type="number"
                      value={thermalLossPercent}
                    />
                  </label>
                </div>
                <button
                  className="primary-action"
                  disabled={catalog.isLoading || catalog.units.length === 0}
                  type="submit"
                >
                  Dodaj produkt
                </button>
              </form>
            )}
          </article>
        </section>
      ) : (
        <section className="dictionary-screen">
          <div className="section-tabs section-tabs--nested" role="tablist" aria-label="Słowniki">
            <button
              aria-selected={activeDictionary === 'units'}
              className={activeDictionary === 'units' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveDictionary('units')}
              role="tab"
              type="button"
            >
              Jednostki
            </button>
            <button
              aria-selected={activeDictionary === 'suppliers'}
              className={activeDictionary === 'suppliers' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveDictionary('suppliers')}
              role="tab"
              type="button"
            >
              Dostawcy
            </button>
            <button
              aria-selected={activeDictionary === 'allergens'}
              className={activeDictionary === 'allergens' ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveDictionary('allergens')}
              role="tab"
              type="button"
            >
              Alergeny
            </button>
          </div>

          {activeDictionary === 'units' ? (
            <div className="dictionary-grid">
              <article className="panel">
                <div className="panel-header">
                  <h2>Lista jednostek</h2>
                  <span className="status-pill status-pill--info">{catalog.units.length}</span>
                </div>
                <div className="dictionary-list" aria-label="Lista jednostek">
                  {catalog.units.map((unit) => (
                    <div className="dictionary-row" key={unit.id}>
                      <strong>{unit.symbol}</strong>
                      <span>
                        {unit.name}, {unitKindLabels[unit.kind]}
                      </span>
                    </div>
                  ))}
                  {catalog.units.length === 0 ? (
                    <p className="empty-state">Dodaj jednostki raz dla całej organizacji.</p>
                  ) : null}
                </div>
              </article>

              <article className="panel">
                <h2>Dodaj jednostkę</h2>
                <form className="form-stack compact-form" onSubmit={handleAddUnit}>
                  <label>
                    Nazwa
                    <input
                      onChange={(event) => setUnitName(event.target.value)}
                      placeholder="Kilogram"
                      required
                      value={unitName}
                    />
                  </label>
                  <label>
                    Symbol
                    <input
                      onChange={(event) => setUnitSymbol(event.target.value)}
                      placeholder="kg"
                      required
                      value={unitSymbol}
                    />
                  </label>
                  <label>
                    Typ
                    <select
                      onChange={(event) => setUnitKind(event.target.value as UnitKind)}
                      value={unitKind}
                    >
                      {Object.entries(unitKindLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="primary-action" disabled={catalog.isLoading} type="submit">
                    Dodaj jednostkę
                  </button>
                </form>
              </article>
            </div>
          ) : activeDictionary === 'suppliers' ? (
            <div className="dictionary-grid">
              <article className="panel">
                <div className="panel-header">
                  <h2>Lista dostawców</h2>
                  <span className="status-pill status-pill--info">{catalog.suppliers.length}</span>
                </div>
                <div className="dictionary-list" aria-label="Lista dostawców">
                  {catalog.suppliers.map((supplier) => (
                    <div className="dictionary-row" key={supplier.id}>
                      <strong>{supplier.name}</strong>
                      <span>Dostępny w kartach produktów</span>
                    </div>
                  ))}
                  {catalog.suppliers.length === 0 ? (
                    <p className="empty-state">Dostawców dodajesz tylko wtedy, gdy są potrzebni.</p>
                  ) : null}
                </div>
              </article>

              <article className="panel">
                <h2>Dodaj dostawcę</h2>
                <form className="form-stack compact-form" onSubmit={handleAddSupplier}>
                  <label>
                    Nazwa
                    <input
                      onChange={(event) => setSupplierName(event.target.value)}
                      placeholder="Dostawca warzyw"
                      required
                      value={supplierName}
                    />
                  </label>
                  <button className="primary-action" disabled={catalog.isLoading} type="submit">
                    Dodaj dostawcę
                  </button>
                </form>
              </article>
            </div>
          ) : (
            <div className="dictionary-grid">
              <article className="panel">
                <div className="panel-header">
                  <h2>Lista alergenów</h2>
                  <span className="status-pill status-pill--info">{catalog.allergens.length}</span>
                </div>
                <div className="dictionary-list" aria-label="Lista alergenów">
                  {catalog.allergens.map((allergen) => (
                    <div className="dictionary-row" key={allergen.id}>
                      <strong>{allergen.name}</strong>
                      <span>{allergen.code || 'bez kodu'}</span>
                    </div>
                  ))}
                  {catalog.allergens.length === 0 ? (
                    <p className="empty-state">Dodaj alergeny używane w kartach produktów.</p>
                  ) : null}
                </div>
              </article>

              <article className="panel">
                <h2>Dodaj alergen</h2>
                <form className="form-stack compact-form" onSubmit={handleAddAllergen}>
                  <label>
                    Nazwa
                    <input
                      onChange={(event) => setAllergenName(event.target.value)}
                      placeholder="Gluten"
                      required
                      value={allergenName}
                    />
                  </label>
                  <label>
                    Kod
                    <input
                      onChange={(event) => setAllergenCode(event.target.value)}
                      placeholder="A1"
                      value={allergenCode}
                    />
                  </label>
                  <button className="primary-action" disabled={catalog.isLoading} type="submit">
                    Dodaj alergen
                  </button>
                </form>
              </article>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
