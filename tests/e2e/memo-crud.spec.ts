import { test, expect, Page } from '@playwright/test'

// 시나리오: tests/e2e/scenarios/01~03 (작성 → 수정 → 삭제)
// 실제 Supabase DB를 사용하므로 "[E2E]" 접두사가 붙은 전용 메모만 다룬다.
const RUN_ID = Date.now()
const CREATED_TITLE = `[E2E] 작성-${RUN_ID}`
const UPDATED_TITLE = `[E2E] 수정-${RUN_ID}`

const cardByTitle = (page: Page, title: string) =>
  page.getByTestId('memo-card').filter({ hasText: title })

const readTotal = async (page: Page): Promise<number> => {
  const text = await page.getByText(/총 \d+개의 메모/).innerText()
  return Number(text.match(/\d+/)![0])
}

const openHome = async (page: Page) => {
  await page.goto('/')
  await expect(page.getByText('메모를 불러오는 중...')).toBeHidden()
  await expect(page.getByText(/총 \d+개의 메모/)).toBeVisible()
}

// 확인 창을 수락하며 해당 제목의 메모를 삭제한다 (정리용)
const deleteByTitle = async (page: Page, title: string) => {
  const card = cardByTitle(page, title)
  while ((await card.count()) > 0) {
    page.once('dialog', dialog => dialog.accept())
    await card.first().getByRole('button', { name: '삭제' }).click()
    await expect(card).toHaveCount(0)
  }
}

test.describe.serial('메모 CRUD', () => {
  test.afterAll(async ({ browser }) => {
    // 중간에 실패해도 테스트 데이터가 남지 않도록 정리
    const page = await browser.newPage({ baseURL: 'http://localhost:3000' })
    await openHome(page)
    await deleteByTitle(page, CREATED_TITLE)
    await deleteByTitle(page, UPDATED_TITLE)
    await page.close()
  })

  test('01 메모 작성 (P0)', async ({ page }) => {
    await openHome(page)
    await expect(page).toHaveTitle('슈퍼 메모앱')
    await expect(
      page.getByRole('heading', { name: '📝 슈퍼 메모앱' })
    ).toBeVisible()
    const before = await readTotal(page)

    await page.getByRole('button', { name: '새 메모' }).click()
    await expect(
      page.getByRole('heading', { name: '새 메모 작성' })
    ).toBeVisible()

    await page.getByLabel('제목 *').fill(CREATED_TITLE)
    await page.getByLabel('카테고리').selectOption('work')
    // 편집기는 동적 로딩이므로 textarea가 나타날 때까지 대기
    const editor = page.locator('[data-testid="memo-content-editor"] textarea')
    await editor.fill('E2E 테스트로 작성한 메모입니다.')
    await page
      .getByPlaceholder('태그를 입력하고 Enter를 누르세요')
      .fill('e2e')
    await page.getByPlaceholder('태그를 입력하고 Enter를 누르세요').press('Enter')
    await expect(page.locator('form').getByText('#e2e')).toBeVisible()

    await page.getByRole('button', { name: '저장하기' }).click()
    // AI 요약 생성으로 저장에 시간이 걸릴 수 있다
    await expect(
      page.getByRole('heading', { name: '새 메모 작성' })
    ).toBeHidden({ timeout: 30_000 })

    // 최신순이므로 맨 앞에 표시된다
    const firstCard = page.getByTestId('memo-card').first()
    await expect(firstCard).toContainText(CREATED_TITLE)
    await expect(firstCard).toContainText('업무')
    await expect(firstCard).toContainText('#e2e')
    await expect(page.getByText(`총 ${before + 1}개의 메모`)).toBeVisible()

    // 영속화 검증
    await page.reload()
    await expect(cardByTitle(page, CREATED_TITLE)).toHaveCount(1)
  })

  test('02 메모 수정 (P1)', async ({ page }) => {
    await openHome(page)
    const before = await readTotal(page)
    const card = cardByTitle(page, CREATED_TITLE)

    await card.getByRole('button', { name: '편집' }).click()
    await expect(page.getByRole('heading', { name: '메모 편집' })).toBeVisible()
    // 편집 버튼 클릭이 상세 보기를 열지 않아야 한다
    await expect(page.getByTestId('memo-viewer')).toBeHidden()

    // 기존 값이 채워져 있다
    await expect(page.getByLabel('제목 *')).toHaveValue(CREATED_TITLE)
    await expect(page.getByLabel('카테고리')).toHaveValue('work')
    await expect(page.locator('form').getByText('#e2e')).toBeVisible()

    await page.getByLabel('제목 *').fill(UPDATED_TITLE)
    await page.getByLabel('카테고리').selectOption('study')
    await page
      .locator('[data-testid="memo-content-editor"] textarea')
      .fill('수정된 내용입니다.')
    // 편집 모드에서는 버튼 이름이 '수정하기'이다
    await page.getByRole('button', { name: '수정하기' }).click()
    await expect(page.getByRole('heading', { name: '메모 편집' })).toBeHidden({
      timeout: 30_000,
    })

    // 같은 카드가 갱신되고 개수는 그대로다
    const updated = cardByTitle(page, UPDATED_TITLE)
    await expect(updated).toHaveCount(1)
    await expect(updated).toContainText('학습')
    await expect(cardByTitle(page, CREATED_TITLE)).toHaveCount(0)
    await expect(page.getByText(`총 ${before}개의 메모`)).toBeVisible()

    // 상세 보기에서 수정 내용 확인
    await updated.click()
    const viewer = page.getByTestId('memo-viewer')
    await expect(viewer).toContainText(UPDATED_TITLE)
    await expect(viewer).toContainText('학습')
    await expect(page.getByTestId('memo-viewer-content')).toContainText(
      '수정된 내용입니다.'
    )
    await page.getByTestId('memo-viewer-close-btn').click()

    // 영속화 검증
    await page.reload()
    await expect(cardByTitle(page, UPDATED_TITLE)).toHaveCount(1)
  })

  test('03 메모 삭제 (P1)', async ({ page }) => {
    await openHome(page)
    const before = await readTotal(page)
    const card = cardByTitle(page, UPDATED_TITLE)

    // 확인 창에서 취소하면 삭제되지 않는다
    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('정말로 이 메모를 삭제하시겠습니까?')
      return dialog.dismiss()
    })
    await card.getByRole('button', { name: '삭제' }).click()
    await expect(card).toHaveCount(1)
    await expect(page.getByText(`총 ${before}개의 메모`)).toBeVisible()

    // 확인 창을 수락하면 삭제된다
    page.once('dialog', dialog => dialog.accept())
    await card.getByRole('button', { name: '삭제' }).click()
    await expect(card).toHaveCount(0)
    await expect(page.getByText(`총 ${before - 1}개의 메모`)).toBeVisible()

    // 검색 결과 없음
    await page.getByPlaceholder('메모 검색...').fill(UPDATED_TITLE)
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible()

    // 영속화 검증
    await page.reload()
    await expect(cardByTitle(page, UPDATED_TITLE)).toHaveCount(0)
  })
})
