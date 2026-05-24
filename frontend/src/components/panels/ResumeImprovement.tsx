import { Sparkles, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { improveResume } from '../../api/resumeApi';
import { nexusToast } from '../ui/NexusToast';

interface ResumeImprovementProps {
  resumeText: string;
  focusArea?: string;
}

interface Improvement {
  id: string;
  area: string;
  suggestion: string;
  expanded: boolean;
}

export default function ResumeImprovement({ resumeText, focusArea }: ResumeImprovementProps) {
  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [focusInput, setFocusInput] = useState(focusArea || '');

  const handleGetImprovements = async () => {
    if (!resumeText) {
      nexusToast('Please upload a resume first', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await improveResume(resumeText, focusInput || undefined);
      const parsed = parseImprovements(response.improvements);
      setImprovements(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get improvements';
      setError(message);
      nexusToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const parseImprovements = (text: string): Improvement[] => {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map((line, i) => ({
        id: `imp-${i}`,
        area: line.split(':')[0].replace(/^\d+\.\s*/, '').trim(),
        suggestion: line.split(':').slice(1).join(':').trim() || line,
        expanded: false
      }));
  };

  const toggleExpand = (id: string) => {
    setImprovements(prev =>
      prev.map(imp => (imp.id === id ? { ...imp, expanded: !imp.expanded } : imp))
    );
  };

  return (
    <div className="glass-panel space-y-4 rounded-lg border border-white/10 p-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-cyan" />
        <h3 className="text-lg font-semibold">Resume Improvements</h3>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-white/60">Focus Area (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Skills, Experience, Achievements"
            value={focusInput}
            onChange={(e) => setFocusInput(e.target.value)}
            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan focus:outline-none"
          />
        </div>

        <button
          onClick={handleGetImprovements}
          disabled={loading}
          className="w-full rounded bg-gradient-to-r from-cyan to-blue-500 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Analyzing Resume...
            </span>
          ) : (
            'Get Improvements'
          )}
        </button>
      </div>

      {/* Improvements List */}
      {improvements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan/80">
            {improvements.length} Improvement{improvements.length !== 1 ? 's' : ''} Found
          </p>
          <div className="space-y-2">
            {improvements.map((imp, index) => (
              <div
                key={imp.id}
                className="rounded-lg border border-white/10 bg-white/5 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleExpand(imp.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/20 text-xs font-semibold text-cyan">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{imp.area}</p>
                      <p className="text-xs text-white/50 line-clamp-1">{imp.suggestion}</p>
                    </div>
                  </div>
                  {imp.expanded ? (
                    <ChevronUp className="h-4 w-4 text-white/50" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/50" />
                  )}
                </button>

                {imp.expanded && (
                  <div className="border-t border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm leading-relaxed text-white/80">{imp.suggestion}</p>
                  </div>
                )}
              </div>
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

      {/* Empty State */}
      {!loading && improvements.length === 0 && !error && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-sm text-white/60">
            Click "Get Improvements" to receive AI-powered suggestions for enhancing your resume.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-semibold text-white/60">💡 Pro Tips:</p>
        <ul className="space-y-1 text-xs text-white/50">
          <li>• Use quantifiable metrics (e.g., "increased revenue by 25%")</li>
          <li>• Focus on achievements, not just responsibilities</li>
          <li>• Tailor descriptions to match job requirements</li>
          <li>• Keep language active and impactful</li>
        </ul>
      </div>
    </div>
  );
}
