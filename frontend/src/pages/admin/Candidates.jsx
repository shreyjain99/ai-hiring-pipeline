import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { api } from '../../lib/api'

const STAGES = ['all', 'applied', 'questionnaire_sent', 'questionnaire_completed', 'eligible', 'scored', 'shortlisted', 'human_review', 'rejected']

export default function Candidates() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  useEffect(() => {
    api.getCandidates()
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchesStage = stageFilter === 'all' || c.stage === stageFilter
    return matchesSearch && matchesStage
  })

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Candidates</h2>
          <p className="text-sm text-gray-500 mt-1">{candidates.length} total applicants</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map(stage => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${stageFilter === stage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {stage === 'all' ? 'All' : stage.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <Card>
          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500 text-center">No candidates found.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/admin/candidate/${c.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{c.email}</td>
                    <td className="px-6 py-3">
                      <Badge stage={c.stage} label={c.stage.replace(/_/g, ' ')} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.score != null ? `${c.score}/100` : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
