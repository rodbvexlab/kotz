import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './app/providers'
import { App } from './app/App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
