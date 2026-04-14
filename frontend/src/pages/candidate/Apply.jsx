import { useState } from 'react'
import { CheckCircle, Upload } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export default function Apply() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  function handleEmailChange(e) {
    const val = e.target.value
    setForm({ ...form, email: val })
    if (val && !EMAIL_REGEX.test(val)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file)
    } else {
      setError('Please upload a PDF or DOCX file.')
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) setResumeFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!EMAIL_REGEX.test(form.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    if (!resumeFile) {
      setError('Please upload your resume.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('first_name', form.first_name)
      formData.append('last_name', form.last_name)
      formData.append('email', form.email)
      formData.append('resume', resumeFile)
      await api.apply(formData)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center flex flex-col items-center gap-4 max-w-sm">
          <CheckCircle size={48} className="text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Application Submitted!</h2>
          <p className="text-sm text-gray-500">
            Thank you for applying. Check your email — we'll send you a questionnaire shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Job Application</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your details and upload your resume</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="font-medium text-gray-900">Your Information</h3>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Smith"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="text"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleEmailChange}
                error={emailError}
                required
              />

              {/* Resume upload */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Resume</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  {resumeFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={20} className="text-green-500" />
                      <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                      <button type="button" onClick={() => setResumeFile(null)} className="text-xs text-gray-400 hover:text-gray-600">Remove</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={20} className="text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Drag and drop or{' '}
                        <label className="text-blue-600 cursor-pointer hover:underline">
                          browse
                          <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
                        </label>
                      </p>
                      <p className="text-xs text-gray-400">PDF or DOCX only</p>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading || !!emailError} className="w-full mt-2">
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
