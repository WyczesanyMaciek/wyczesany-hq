import { test, expect, Page } from '@playwright/test'

// Pobierz pierwszy context ID z sidebara
async function getFirstContextId(page: Page) {
  await page.goto('/')
  await page.waitForSelector('[class*="t-sidebar-item"]')
  const link = page.locator('a[href^="/c/"]').first()
  const href = await link.getAttribute('href')
  return href?.replace('/c/', '') || ''
}

test.describe('Smoke Tests', () => {
  test('strona główna ładuje się', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Wyczesany/)
    await expect(page.locator('.t-sidebar')).toBeVisible()
  })

  test('dashboard kontekstu ładuje się', async ({ page }) => {
    const ctxId = await getFirstContextId(page)
    await page.goto(`/c/${ctxId}`)
    // Nie powinno być 404
    await expect(page.locator('text=404')).not.toBeVisible({ timeout: 5000 })
    // Powinny być sekcje
    await expect(page.locator('.t-section-header').first()).toBeVisible({ timeout: 10000 })
  })

  test('strona projektu ładuje się', async ({ page }) => {
    const ctxId = await getFirstContextId(page)
    await page.goto(`/c/${ctxId}`)
    // Kliknij pierwszy projekt jeśli jest
    const projectLink = page.locator('.t-project-name a, .t-project-name').first()
    if (await projectLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await projectLink.click()
      await expect(page.locator('text=404')).not.toBeVisible({ timeout: 5000 })
    }
  })

  test('settings ładuje się', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('text=404')).not.toBeVisible({ timeout: 5000 })
  })

  test('sidebar ma konteksty', async ({ page }) => {
    await page.goto('/')
    const items = page.locator('.t-sidebar-item')
    await expect(items.first()).toBeVisible({ timeout: 10000 })
    expect(await items.count()).toBeGreaterThan(0)
  })

  test('sidebar ma ikony nawigacji', async ({ page }) => {
    await page.goto('/')
    const icons = page.locator('.t-sidebar-nav-icon')
    await expect(icons.first()).toBeVisible()
    expect(await icons.count()).toBeGreaterThanOrEqual(3)
  })

  test('klik kontekst w sidebar → content ładuje się', async ({ page }) => {
    await page.goto('/')
    const firstCtx = page.locator('a[href^="/c/"]').first()
    await firstCtx.click()
    await page.waitForURL(/\/c\//)
    await expect(page.locator('text=404')).not.toBeVisible({ timeout: 5000 })
  })
})
