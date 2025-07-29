import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BgmProvider } from './components/context/BgmContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BgmProvider>
    <App />
  </BgmProvider>
  // </StrictMode>,
)
