const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(method, path, body, isFormData = false) {
  const options = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  }
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Jobs
  createJob: (data) => request('POST', '/job', data),
  getJobs: () => request('GET', '/jobs'),

  // Questions
  createQuestions: (jobId, questions) => request('POST', `/job/${jobId}/questions`, questions),
  getQuestions: (jobId) => request('GET', `/job/${jobId}/questions`),

  // Candidates
  apply: (formData) => request('POST', '/apply', formData, true), // formData: first_name, last_name, email, resume (file)
  getCandidates: () => request('GET', '/candidates'),
  getCandidate: (id) => request('GET', `/candidate/${id}`),
  approveCandidate: (id) => request('POST', `/candidate/${id}/approve`),
  rejectCandidate: (id) => request('POST', `/candidate/${id}/reject`),
}
