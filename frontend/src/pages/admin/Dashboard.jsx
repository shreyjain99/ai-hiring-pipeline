import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, Clock, Star } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { Card, CardBody } from '../../components/ui/Card'
import { api } from '../../lib/api'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.stage === 'shortlisted' || c.stage === 'human_review').length,
    pending: candidates.filter(c => ['applied', 'questionnaire_sent', 'questionnaire_completed'].includes(c.stage)).length,
    eligible: candidates.filter(c => ['eligible', 'scored'].includes(c.stage)).length,
  }

  const recent = candidates.slice(0, 5)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Overview of your hiring pipeline</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Applicants" value={stats.total} color="bg-blue-500" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-yellow-500" />
              <StatCard icon={CheckCircle} label="Eligible" value={stats.eligible} color="bg-indigo-500" />
              <StatCard icon={Star} label="Shortlisted" value={stats.shortlisted} color="bg-green-500" />
            </div>

            <Card>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Recent Applicants</h3>
                <button
                  onClick={() => navigate('/admin/candidates')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recent.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-gray-500 text-center">No candidates yet.</p>
                ) : (
                  recent.map(c => (
                    <div
                      key={c.id}
                      className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/candidate/${c.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{c.stage.replace(/_/g, ' ')}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
