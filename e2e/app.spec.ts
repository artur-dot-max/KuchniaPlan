import { expect, test } from '@playwright/test'

test('shows Supabase setup before the app is configured', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Połącz Supabase' })).toBeVisible()
  await expect(
    page.getByText('VITE_SUPABASE_URL=https://faoisqiulgowkqmqjumc.supabase.co'),
  ).toBeVisible()
})
