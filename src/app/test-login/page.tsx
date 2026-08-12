'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function TestLoginPage() {
  const [email, setEmail] = useState('juanestebanbecerra78@gmail.com')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test authentication' })
    } finally {
      setLoading(false)
    }
  }

  const checkEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to check environment' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green mb-8">Debug Authentication</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={testAuth} disabled={loading}>
                {loading ? 'Testing...' : 'Test Authentication'}
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <Button onClick={checkEnv} disabled={loading}>
              {loading ? 'Checking...' : 'Check Environment Variables'}
            </Button>
          </div>

          {result && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Result:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
