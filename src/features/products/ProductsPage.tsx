import type { FormEvent } from 'react'
import { useState } from 'react'

import type { UnitKind } from '../../domain/products/types'
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
  const [localError, setLocalError] = useState<string | null>(null)

  const effectiveBaseUnitId = baseUnitId || catalog.units[0]?.id || ''

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

  return (
    <div className="screen-stack">
      <section className="toolbar-band" aria-labelledby="products-heading">
        <div>
          <p className="eyebrow">Etap 3</p>
          <h1 id="products-heading">Produkty</h1>
          <p className="page-lead">
            Katalog surowców, jednostek, dostawców i podstawowych strat technologicznych.
          </p>
        </div>
      </section>

      <section className="content-grid content-grid--wide">
        <article className="panel">
          <div className="panel-header">
            <h2>Lista produktów</h2>
            <span className="status-pill status-pill--info">{catalog.products.length} pozycji</span>
          </div>

          {catalog.isLoading ? <p className="page-lead">Ładuję katalog...</p> : null}
          {catalog.error ? <p className="form-message">{catalog.error}</p> : null}
          {localError ? <p className="form-message">{localError}</p> : null}

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
                  <span role="cell">
                    {product.initialLossPercent}% / {product.thermalLossPercent}%
                  </span>
                </div>
              )
            })}
            {catalog.products.length === 0 && !catalog.isLoading ? (
              <p className="empty-state">Brak produktów w wybranej organizacji.</p>
            ) : null}
          </div>
        </article>

        <aside className="side-stack">
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

          <article className="panel">
            <h2>Dodaj produkt</h2>
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
                <select onChange={(event) => setSupplierId(event.target.value)} value={supplierId}>
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
          </article>
        </aside>
      </section>
    </div>
  )
}
