import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProtectedRoute } from './components/ProtectedRoute'

import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import JobCreate from './pages/admin/Job'
import Candidates from './pages/admin/Candidates'
import CandidateDetail from './pages/admin/CandidateDetail'

import CandidateLogin from './pages/candidate/Login'
import Apply from './pages/candidate/Apply'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />

        {/* Candidate routes */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/apply" element={<Apply />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
        <Route path="/admin/job" element={<AdminProtectedRoute><JobCreate /></AdminProtectedRoute>} />
        <Route path="/admin/candidates" element={<AdminProtectedRoute><Candidates /></AdminProtectedRoute>} />
        <Route path="/admin/candidate/:id" element={<AdminProtectedRoute><CandidateDetail /></AdminProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
