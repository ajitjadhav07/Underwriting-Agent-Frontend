import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage    from './pages/UploadPage'
import JobStatusPage from './pages/JobStatusPage'
import ReviewPage    from './pages/ReviewPage'
import Layout        from './components/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="upload"    element={<UploadPage />} />
          <Route path="jobs/:id"  element={<JobStatusPage />} />
          <Route path="review/:id" element={<ReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
