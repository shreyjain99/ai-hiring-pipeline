import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Recruiter Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access the hiring dashboard</p>
        </div>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full mt-2">
                Sign In
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
