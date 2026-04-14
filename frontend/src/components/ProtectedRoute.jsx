import { Navigate } from 'react-router-dom'

export function AdminProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('admin_auth') === 'true'
  if (!isAuth) return <Navigate to="/admin/login" replace />
  return children
}
