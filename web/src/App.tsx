import { useEffect, useState } from 'react'
import { ItemsFeature } from './features/items/ItemsFeature'
import './App.css'

function App() {
  const [health, setHealth] = useState('Проверяем подключение к API…')

  useEffect(() => {
    const controller = new AbortController()
    async function checkHealth() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal })
        if (!response.ok || (await response.json()).status !== 'ok') {
          throw new Error('API is not ready')
        }
        setHealth('API доступен')
      } catch {
        if (!controller.signal.aborted) setHealth('API недоступен. Проверьте запуск сервера.')
      }
    }
    void checkHealth()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <header>
        <h1>Список покупок</h1>
        <p role="status" aria-live="polite">{health}</p>
      </header>
      <ItemsFeature />
    </main>
  )
}

export default App
