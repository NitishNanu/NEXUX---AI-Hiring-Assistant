import { DollarSign, TrendingUp, MapPin, Briefcase, AlertCircle, Loader } from 'lucide-react';
import { useState } from 'react';
import { getSalaryExpectations } from '../../api/resumeApi';
import { nexusToast } from '../ui/NexusToast';

interface SalaryExpectationsProps {
  resumeText: string;
  jobTitle?: string;
  experienceYears?: number;
  location?: string;
}

export default function SalaryExpectations({ resumeText, jobTitle, experienceYears, location }: SalaryExpectationsProps) {
  const [loading, setLoading] = useState(false);
  const [expectations, setExpectations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchSalary = async () => {
    if (!resumeText) {
      nexusToast('Please upload a resume first', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getSalaryExpectations(resumeText, jobTitle, experienceYears, location);
      setExpectations(response.salary_guidance);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch salary expectations';
      setError(message);
      nexusToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel space-y-4 rounded-lg border border-white/10 p-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-5 w-5 text-cyan" />
        <h3 className="text-lg font-semibold">Salary Expectations</h3>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/60">Job Title</label>
            <input
              type="text"
              placeholder="e.g., Senior Engineer"
              defaultValue={jobTitle || ''}
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60">Location</label>
            <input
              type="text"
              placeholder="e.g., San Francisco, CA"
              defaultValue={location || ''}
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/60">Years of Experience</label>
          <input
            type="number"
            placeholder="e.g., 5"
            defaultValue={experienceYears || ''}
            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan focus:outline-none"
          />
        </div>

        <button
          onClick={handleFetchSalary}
          disabled={loading}
          className="w-full rounded bg-gradient-to-r from-cyan to-blue-500 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Get Salary Expectations'
          )}
        </button>
      </div>

      {/* Results Section */}
      {expectations && (
        <div className="space-y-4 rounded-lg border border-emerald/30 bg-emerald/5 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald" />
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Salary Analysis</p>
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-white/80">
            {expectations.split('\n').map((line, i) => (
              line.trim() && (
                <p key={i} className="flex gap-2">
                  <span className="text-cyan">→</span>
                  <span>{line.trim()}</span>
                </p>
              )
            ))}
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-xs font-semibold text-red-400">Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Helpful Info */}
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-semibold text-white/60">💡 Tips for Better Results:</p>
        <ul className="space-y-1 text-xs text-white/50">
          <li>• Include job title for accurate role-based salary ranges</li>
          <li>• Specify location to account for cost-of-living differences</li>
          <li>• List years of experience for seniority-based adjustments</li>
        </ul>
      </div>
    </div>
  );
}
