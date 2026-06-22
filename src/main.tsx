import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PipelinePage } from './features/leads/PipelinePage'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="*" element={<Navigate to="/pipeline" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
