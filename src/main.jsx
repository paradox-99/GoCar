import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import router from './routes/Routes.jsx'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@mui/material'
import { theme } from './components/Theme.jsx'
import AuthProvider from './provider/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </HelmetProvider>
    </AuthProvider>
  </StrictMode>,
)