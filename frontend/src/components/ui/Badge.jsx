import { cn } from '../../lib/utils'

const stageColors = {
  applied: 'bg-gray-100 text-gray-700',
  questionnaire_sent: 'bg-yellow-100 text-yellow-700',
  questionnaire_completed: 'bg-blue-100 text-blue-700',
  eligible: 'bg-indigo-100 text-indigo-700',
  scored: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-green-100 text-green-700',
  human_review: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
}

export function Badge({ label, stage, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        stageColors[stage] || 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {label || stage}
    </span>
  )
}
