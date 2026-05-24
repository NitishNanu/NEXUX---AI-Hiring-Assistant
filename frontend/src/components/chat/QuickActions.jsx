import { DollarSign, HelpCircle, Sparkles } from 'lucide-react';

const actions = [
  { label: 'Generate Interview Questions', icon: HelpCircle, color: 'text-brand-cyan', kind: 'questions' },
  { label: 'Improve My Resume', icon: Sparkles, color: 'text-brand-indigo', prompt: 'Review my resume and suggest the highest-impact improvements.' },
  { label: 'Salary Estimate', icon: DollarSign, color: 'text-status-green', prompt: 'Estimate salary bands for roles that match this resume.' },
];

export default function QuickActions({ onQuestions, onPrompt, disabled }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => (action.kind === 'questions' ? onQuestions() : onPrompt(action.prompt))}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/72 transition hover:-translate-y-0.5 hover:border-brand-indigo/35 hover:text-white disabled:opacity-50"
          >
            <Icon className={`h-3.5 w-3.5 ${action.color}`} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
