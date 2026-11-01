import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { initGlobalCyberSplash } from './utils/cyberSplash'

// Kích hoạt bộ hiệu ứng giả lập tóe màu Hồng & Xanh toàn cục trên toàn bộ nút bấm
initGlobalCyberSplash();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
