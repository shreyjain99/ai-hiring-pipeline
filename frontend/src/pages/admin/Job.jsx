import { useState } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { AdminLayout } from '../../components/AdminLayout'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Input, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

function QuestionRow({ index, question, onChange, onRemove }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
      <Input
        placeholder="Enter question"
        value={question.question_text}
        onChange={(e) => onChange({ ...question, question_text: e.target.value })}
      />
      <Textarea
        placeholder="Expected / ideal answer"
        rows={2}
        value={question.expected_answer}
        onChange={(e) => onChange({ ...question, expected_answer: e.target.value })}
      />
    </div>
  )
}

export default function JobCreate() {
  const [step, setStep] = useState(1) // 1 = job details, 2 = questions
  const [jobId, setJobId] = useState(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    shortlist_threshold: '',
  })

  const [questions, setQuestions] = useState([
    { question_text: '', expected_answer: '' },
  ])

  async function handleJobSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const job = await api.createJob({
        ...jobForm,
        shortlist_threshold: Number(jobForm.shortlist_threshold),
      })
      setJobId(job.id)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleQuestionsSubmit(e) {
    e.preventDefault()
    setError('')
    const valid = questions.every(q => q.question_text.trim() && q.expected_answer.trim())
    if (!valid) {
      setError('Please fill in all questions and expected answers.')
      return
    }
    setLoading(true)
    try {
      await api.createQuestions(jobId, questions.map((q, i) => ({ ...q, order_index: i })))
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function addQuestion() {
    setQuestions([...questions, { question_text: '', expected_answer: '' }])
  }

  function updateQuestion(index, updated) {
    setQuestions(questions.map((q, i) => (i === index ? updated : q)))
  }

  function removeQuestion(index) {
    if (questions.length === 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  if (done) {
    return (
      <AdminLayout>
        <div className="max-w-lg mx-auto text-center py-16 flex flex-col items-center gap-4">
          <CheckCircle size={48} className="text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900">Job Created!</h2>
          <p className="text-sm text-gray-500">The job and questionnaire have been saved successfully.</p>
          <Button onClick={() => { setDone(false); setStep(1); setJobId(null); setJobForm({ title: '', description: '', requirements: '', shortlist_threshold: '' }); setQuestions([{ question_text: '', expected_answer: '' }]) }}>
            Create Another Job
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create Job</h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Fill in the job details' : 'Define the questionnaire questions and expected answers'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {['Job Details', 'Questionnaire'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{label}</span>
              {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Job Details</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleJobSubmit} className="flex flex-col gap-4">
                <Input
                  label="Job Title"
                  placeholder="e.g. Software Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
                <Textarea
                  label="Job Description"
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  required
                />
                <Textarea
                  label="Requirements"
                  placeholder="List the skills and experience required..."
                  rows={3}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  required
                />
                <Input
                  label="Shortlist Threshold (0–100)"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 70"
                  value={jobForm.shortlist_threshold}
                  onChange={(e) => setJobForm({ ...jobForm, shortlist_threshold: e.target.value })}
                  required
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="self-end">
                  {loading ? 'Saving...' : 'Next: Add Questions'}
                </Button>
              </form>
            </CardBody>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <h3 className="font-medium text-gray-900">Questionnaire</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleQuestionsSubmit} className="flex flex-col gap-4">
                {questions.map((q, i) => (
                  <QuestionRow
                    key={i}
                    index={i}
                    question={q}
                    onChange={(updated) => updateQuestion(i, updated)}
                    onRemove={() => removeQuestion(i)}
                  />
                ))}
                <Button type="button" variant="secondary" onClick={addQuestion} className="self-start">
                  <Plus size={15} /> Add Question
                </Button>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Create Job'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
