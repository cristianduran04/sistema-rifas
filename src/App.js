import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Páginas públicas
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RifaDetalle from './pages/RifaDetalle'
import HistorialRifas from './pages/HistorialRifas'
import GanadorPublico from './pages/GanadorPublico'

// Admin
import Dashboard from './admin/Dashboard'
import CrearRifa from './admin/CrearRifa'
import RifasAdmin from './admin/RifasAdmin'
import Estadisticas from './admin/Estadisticas'
import ComprasAdmin from './admin/ComprasAdmin'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* NAVBAR SIEMPRE VISIBLE */}
        <Navbar />

        <Routes>
          {/* PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rifa/:id" element={<RifaDetalle />} />
          <Route path="/historial" element={<HistorialRifas />} />
          <Route path="/ganador/:id" element={<GanadorPublico />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/crear"
            element={
              <ProtectedRoute adminOnly>
                <CrearRifa />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rifas"
            element={
              <ProtectedRoute adminOnly>
                <RifasAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/estadisticas"
            element={
              <ProtectedRoute adminOnly>
                <Estadisticas />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/compras"
  element={
    <ProtectedRoute adminOnly>
      <ComprasAdmin />
    </ProtectedRoute>
  }
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

