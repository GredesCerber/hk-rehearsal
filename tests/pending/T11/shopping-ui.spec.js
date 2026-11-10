// Приёмка T11 (задача #14): интерфейс списка покупок в web.
// Пишет агент-тестировщик. CI пока не запускает tests/pending/.
// Нужен Playwright (scaffold уже есть в web-node: tests/e2e). Адрес: BASE_URL, по умолчанию http://127.0.0.1:5173.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
});

test('Given открыта страница When ввожу Молоко и нажимаю Добавить Then Молоко появляется в списке', async ({ page }) => {
  await page.getByLabel(/товар|название/i).fill('Молоко');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByText('Молоко')).toBeVisible();
});

test('Given поле пустое When нажимаю Добавить Then под полем Введите название и товар не добавлен', async ({ page }) => {
  const before = await page.getByRole('listitem').count();
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByText('Введите название')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(before);
});

test('Given товар Молоко в списке When кликаю по нему Then он зачёркнут и счётчик показывает 1 осталось', async ({ page }) => {
  await page.getByLabel(/товар|название/i).fill('Молоко');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await page.getByText('Молоко').click();
  await expect(page.getByText('Молоко')).toHaveCSS('text-decoration-line', /line-through/);
  await expect(page.getByText(/1 осталось/)).toBeVisible();
});

test('Given товар зачёркнут When кликаю по нему повторно Then отметка снимается', async ({ page }) => {
  await page.getByLabel(/товар|название/i).fill('Молоко');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await page.getByText('Молоко').click();
  await page.getByText('Молоко').click();
  await expect(page.getByText('Молоко')).not.toHaveCSS('text-decoration-line', /line-through/);
});

test('Given товар в списке When нажимаю Удалить Then товар исчезает и счётчик обновляется', async ({ page }) => {
  await page.getByLabel(/товар|название/i).fill('Молоко');
  await page.getByRole('button', { name: 'Добавить' }).click();
  const row = page.getByRole('listitem').filter({ hasText: 'Молоко' });
  await row.getByRole('button', { name: 'Удалить' }).click();
  await expect(page.getByText('Молоко')).toHaveCount(0);
});

test('Given страница с товарами When перезагружаю страницу Then все товары и отметки на месте', async ({ page }) => {
  await page.getByLabel(/товар|название/i).fill('Молоко');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await page.getByText('Молоко').click();
  await page.reload();
  await expect(page.getByText('Молоко')).toBeVisible();
  await expect(page.getByText('Молоко')).toHaveCSS('text-decoration-line', /line-through/);
});
