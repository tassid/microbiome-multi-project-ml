import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Apresentacao from './Apresentacao.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Apresentacao />
  </StrictMode>,
)
