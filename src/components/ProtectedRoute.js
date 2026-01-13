import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly }) {
  const { user, rol } = useAuth()

  if (!user) return <Navigate to="/login" />
  if (adminOnly && rol !== 'admin') return <Navigate to="/" />

  return children
}
