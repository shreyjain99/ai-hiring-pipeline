import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

export default function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCandidate(id)
      .then(setCandidate)
      .catch(() => setError('Failed to load candidate'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApprove() {
    setActionLoading(true)
    try {
      const updated = await api.approveCandidate(id)
      setCandidate(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    setActionLoading(true)
    try {
      const updated = await api.rejectCandidate(id)
      setCandidate(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const canAction = candidate && ['shortlisted', 'human_review', 'eligible', 'scored'].includes(candidate.stage)

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <button
          onClick={() => navigate('/admin/candidates')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors self-start"
        >
          <ArrowLeft size={15} /> Back to Candidates
        </button>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{candidate.first_name} {candidate.last_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{candidate.email}</p>
              </div>
              <Badge stage={candidate.stage} label={candidate.stage.replace(/_/g, ' ')} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardBody className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {candidate.score != null ? `${candidate.score}` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Score / 100</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-sm font-medium text-gray-900 capitalize">{candidate.stage.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">Current Stage</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Applied On</p>
                </CardBody>
              </Card>
            </div>

            {/* Resume */}
            {candidate.resume_text && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-gray-500" />
                    <h3 className="font-medium text-gray-900">Resume</h3>
                    {candidate.resume_filename && (
                      <span className="text-xs text-gray-400">({candidate.resume_filename})</span>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                    {candidate.resume_text}
                  </pre>
                </CardBody>
              </Card>
            )}

            {/* Questionnaire Responses */}
            {candidate.response && (
              <Card>
                <CardHeader>
                  <h3 className="font-medium text-gray-900">Questionnaire Responses</h3>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  {candidate.response.answers && JSON.parse(candidate.response.answers).map((a, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-gray-700">Q{i + 1}: {a.question_text}</p>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{a.answer}</p>
                    </div>
                  ))}
                  {candidate.response.parsed_result && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AI Eligibility Assessment</p>
                      <p className="text-sm text-gray-700 bg-blue-50 rounded-lg px-3 py-2">{candidate.response.parsed_result}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Actions */}
            {canAction && (
              <Card>
                <CardBody className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Take action on this candidate</p>
                  <div className="flex gap-3">
                    <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
                      <XCircle size={15} /> Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={actionLoading}>
                      <CheckCircle size={15} /> Approve
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
