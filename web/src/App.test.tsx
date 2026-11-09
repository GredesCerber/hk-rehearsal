import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from './App'

test('renders the shopping-list shell and an accessible API status', () => {
  const html = renderToStaticMarkup(<App />)
  expect(html).toContain('<h1>Список покупок</h1>')
  expect(html).toContain('role="status"')
  expect(html).toContain('Каркас приложения готов')
})
