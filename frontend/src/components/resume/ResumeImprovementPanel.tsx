import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, DollarSign, FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { improveResume, getSalaryExpectations } from '../../api/resumeApi';
import { useNexusStore } from '../../store/nexusStore';
import { nexusToast } from '../ui/NexusToast';

type Tab = 'improvements' | 'salary' | 'raw';
type FocusArea = 'overall impact' | 'skills' | 'achievements' | 'formatting';

const FOCUS_OPTIONS: { label: string; value: FocusArea }[] = [
  { label: 'Overall Impact', value: 'overall impact' },
  { label: 'Skills & Keywords', value: 'skills' },
  { label: 'Achievements', value: 'achievements' },
  { label: 'Formatting', value: 'formatting' },
];

function parseNumberedList(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const numbered = lines.filter(l => /^\d+[.)]/.test(l));
  if (numbered.length >= 2) {
    return numbered.map(l => l.replace(/^\d+[.)]\s*/, ''));
  }
  // Fallback: return non-empty lines
  return lines;
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          height: 48, borderRadius: 12,
          background: 'linear-gradient(90deg,rgba(124,58,237,0.1),rgba(0,255,209,0.06),rgba(124,58,237,0.1))',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
          opacity: 1 - i * 0.12,
        }} />
      ))}
    </div>
  );
}

export default function ResumeImprovementPanel() {
  const { resumeData } = useNexusStore();
  const [tab, setTab] = useState<Tab>('improvements');
  const [focus, setFocus] = useState<FocusArea>('overall impact');
  const [loading, setLoading] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [salary, setSalary] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasRun, setHasRun] = useState<Record<Tab, boolean>>({ improvements: false, salary: false, raw: true });

  if (!resumeData) {
    return (
      <div style={{
        marginTop: 16, padding: 24, borderRadius: 18, textAlign: 'center',
        border: '1px solid rgba(240,244,255,0.08)',
        background: 'rgba(240,244,255,0.02)',
        color: 'rgba(240,244,255,0.4)',
      }}>
        <Wand2 size={28} style={{ margin: '0 auto 10px', color: 'rgba(124,58,237,0.5)', display: 'block' }} />
        <p style={{ margin: 0, fontSize: 13 }}>Upload a resume to unlock AI improvement suggestions &amp; salary insights.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'improvements', label: 'AI Improvements', icon: Wand2,      color: '#7C3AED' },
    { id: 'salary',       label: 'Salary Insights', icon: DollarSign, color: '#F59E0B' },
    { id: 'raw',          label: 'Raw Text',         icon: FileText,   color: '#00FFD1' },
  ];

  const runImprovements = async () => {
    setLoading(true);
    try {
      const res = await improveResume(resumeData.rawText, focus);
      setImprovements(parseNumberedList(res.improvements));
      setHasRun(prev => ({ ...prev, improvements: true }));
    } catch {
      nexusToast('Failed to generate improvements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runSalary = async () => {
    setLoading(true);
    try {
      const res = await getSalaryExpectations(resumeData.rawText);
      setSalary(res.salary_guidance);
      setHasRun(prev => ({ ...prev, salary: true }));
    } catch {
      nexusToast('Failed to fetch salary data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    const text = tab === 'improvements'
      ? improvements.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : salary;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '11px 16px', borderRadius: 14,
    border: `1px solid ${color}55`,
    background: `linear-gradient(135deg,${color}25,${color}0d)`,
    color: '#f0f4ff', fontWeight: 700, fontSize: 14,
    cursor: loading ? 'not-allowed' : 'pointer',
    marginBottom: 16, opacity: loading ? 0.6 : 1,
    transition: 'all 200ms',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 16, borderRadius: 20,
        border: '1px solid rgba(240,244,255,0.1)',
        background: 'rgba(8,8,15,0.7)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', padding: '12px 12px 0' }}>
        {tabs.map(t => {
          const TIcon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '9px 8px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 500,
                borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                background: 'transparent',
                color: active ? t.color : 'rgba(240,244,255,0.45)',
                transition: 'all 200ms',
              }}
            >
              <TIcon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 20 }}>
        <AnimatePresence mode="wait">
          {/* ── Improvements Tab ── */}
          {tab === 'improvements' && (
            <motion.div key="imp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Focus area pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFocus(opt.value)}
                    style={{
                      padding: '5px 13px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 180ms',
                      border: focus === opt.value ? '1px solid rgba(0,255,209,0.5)' : '1px solid rgba(240,244,255,0.1)',
                      background: focus === opt.value ? 'rgba(0,255,209,0.1)' : 'rgba(240,244,255,0.03)',
                      color: focus === opt.value ? '#00ffd1' : 'rgba(240,244,255,0.55)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button onClick={runImprovements} disabled={loading} style={btnStyle('#7C3AED')}>
                {loading
                  ? <RefreshCw size={15} style={{ animation: 'nexus-orb-spin-cw 0.75s linear infinite' }} />
                  : <Wand2 size={15} />
                }
                {loading ? 'AI is writing improvements…' : hasRun.improvements ? 'Regenerate' : 'Generate AI Improvements'}
              </button>

              {loading && <Skeleton />}

              {!loading && improvements.length > 0 && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {improvements.map((imp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: 'flex', gap: 12, padding: '11px 14px', borderRadius: 12,
                          background: 'rgba(124,58,237,0.06)',
                          border: '1px solid rgba(124,58,237,0.2)',
                        }}
                      >
                        <span style={{
                          minWidth: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(124,58,237,0.22)', color: '#a78bfa',
                          fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {i + 1}
                        </span>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'rgba(240,244,255,0.84)' }}>{imp}</p>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(240,244,255,0.1)', background: 'rgba(240,244,255,0.04)', color: copied ? '#00ff88' : 'rgba(240,244,255,0.55)', fontSize: 12, cursor: 'pointer', transition: 'all 180ms' }}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* ── Salary Tab ── */}
          {tab === 'salary' && (
            <motion.div key="sal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={runSalary} disabled={loading} style={btnStyle('#F59E0B')}>
                {loading
                  ? <RefreshCw size={15} style={{ animation: 'nexus-orb-spin-cw 0.75s linear infinite' }} />
                  : <DollarSign size={15} />
                }
                {loading ? 'Analyzing your profile…' : hasRun.salary ? 'Refresh Estimate' : 'Get Salary Estimate'}
              </button>
              {loading && <Skeleton />}
              {!loading && salary && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ padding: 16, borderRadius: 14, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)', whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.75, color: 'rgba(240,244,255,0.86)' }}>
                    {salary}
                  </div>
                  <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(240,244,255,0.1)', background: 'rgba(240,244,255,0.04)', color: copied ? '#00ff88' : 'rgba(240,244,255,0.55)', fontSize: 12, cursor: 'pointer', transition: 'all 180ms' }}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Raw Text Tab ── */}
          {tab === 'raw' && (
            <motion.div key="raw" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <pre style={{ margin: 0, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(240,244,255,0.07)', fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: 11, lineHeight: 1.75, color: 'rgba(240,244,255,0.7)', maxHeight: 360, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {resumeData.rawText || 'No raw text available.'}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
