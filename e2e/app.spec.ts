import { expect, test } from '@playwright/test'

test('opens the today dashboard', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Dzisiaj' })).toBeVisible()
  await expect(page.getByRole('navigation')).toContainText('Produkcja')
  await expect(page.getByRole('button', { name: 'Dodaj zapotrzebowanie' })).toBeVisible()
})
