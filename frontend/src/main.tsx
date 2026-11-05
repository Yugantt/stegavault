import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')
console.log('[main] root element:', rootEl)

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('[main] render called')
} else {
  console.error('[main] No #root element found!')
}
