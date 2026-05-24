import { Briefcase, MessageCircle, Mic, Sparkles, TrendingUp } from 'lucide-react';

const actions = [
  { label: 'Generate Interview Questions', icon: Mic, accent: 'cyan' },
  { label: 'Improve My Resume', icon: Sparkles, accent: 'violet' },
  { label: 'Salary Insights', icon: TrendingUp, accent: 'gold' },
  { label: 'Find Matching Roles', icon: Briefcase, accent: 'emerald' },
  { label: 'Practice Mock Interview', icon: MessageCircle, accent: 'coral' }
];

export default function QuickActions({ onAction }: { onAction: (label: string) => void }) {
  return (
    <div className="quick-actions">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} className={`quick-chip accent-${action.accent}`} onClick={() => onAction(action.label)}>
            <Icon size={15} /> {action.label}
          </button>
        );
      })}
    </div>
  );
}
