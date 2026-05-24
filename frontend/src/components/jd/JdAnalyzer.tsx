import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Clipboard, FileText, Lightbulb, Lock, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { analyzeAts } from '../../api/atsApi';
import { matchResumeWithJDFile } from '../../api/resumeApi';
import { useNexusStore } from '../../store/nexusStore';
import { nexusToast } from '../ui/NexusToast';
import AtsScoreSphere from '../resume/AtsScoreSphere';

function normalizeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') return maybeMessage;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return fallback;
}

export default function JdAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { resumeData, jdResult, setJdResult } = useNexusStore();

  const runAnalyze = async () => {
    if (!resumeData?.rawText) {
      nexusToast('Upload a resume before analyzing a job description', 'warning');
      return;
    }

    // If JD file is provided, use file-based matching
    if (jdFile && resumeData.file) {
      setLoading(true);
      try {
        const result = await matchResumeWithJDFile(resumeData.file, jdFile);
        setJdResult({
          score: Math.round(result.match_percentage),
          match_level: result.match_level,
          matched_skills: result.matched_skills,
          missing_skills: result.missing_skills,
          suggestions: result.suggestions,
        });
        nexusToast('JD file match analysis complete', 'success');
      } catch (error) {
        nexusToast(normalizeErrorMessage(error, 'JD file analysis failed'), 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise use text-based analysis
    if (!jdText.trim()) {
      nexusToast('Enter a job description or upload a JD file', 'warning');
      return;
    }

    setLoading(true);
    try {
      setJdResult(await analyzeAts(resumeData.file, jdText));
      nexusToast('Match analysis complete', 'success');
    } catch (error) {
      nexusToast(normalizeErrorMessage(error, 'JD analysis failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
        nexusToast('Please upload a PDF, DOCX, or TXT file', 'error');
        return;
      }
      setJdFile(file);
      setJdText(''); // Clear text input when file is selected
      nexusToast(`JD file selected: ${file.name}`, 'success');
    }
  };

  const copyReport = async () => {
    if (!jdResult) return;
    const safeSuggestions = Array.isArray(jdResult.suggestions) ? jdResult.suggestions : [];
    const suggestions = safeSuggestions.map((item) => (typeof item === 'string' ? item : `${item.priority || 'Medium'}: ${item.text}`)).join('\n');
    const matched = Array.isArray(jdResult.matched_skills) ? jdResult.matched_skills.join(', ') : String(jdResult.matched_skills || '');
    const missing = Array.isArray(jdResult.missing_skills) ? jdResult.missing_skills.join(', ') : String(jdResult.missing_skills || '');
    await navigator.clipboard.writeText(`# NEXUS Match Report\n\nScore: ${jdResult.score || 0}/100\n\nMatched: ${matched}\n\nMissing: ${missing}\n\nSuggestions:\n${suggestions}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="jd-analyzer">
      <button className="jd-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>Analyze vs Job Description</span>
        <ChevronDown className={open ? 'rotate-180' : ''} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="jd-panel" initial={{ height: 0, opacity: 0, scaleY: 0.92 }} animate={{ height: 'auto', opacity: 1, scaleY: 1 }} exit={{ height: 0, opacity: 0, scaleY: 0.92 }} transition={{ duration: 0.45 }}>
            <div className="jd-input-options">
              <div className="jd-text-input">
                <label>Paste Job Description</label>
                <textarea
                  maxLength={5000}
                  value={jdText}
                  onChange={(event) => {
                    setJdText(event.target.value);
                    if (event.target.value.trim()) setJdFile(null); // Clear file when typing
                  }}
                  placeholder="Paste the job description here..."
                  disabled={!!jdFile}
                  className={loading ? 'scanning' : ''}
                />
                <span className={`char-counter ${jdText.length > 4500 ? 'danger' : ''}`}>{jdText.length} / 5000</span>
              </div>

              <div className="jd-divider">OR</div>

              <div className="jd-file-input">
                <label>Upload JD File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  className="file-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload size={16} />
                  {jdFile ? `📄 ${jdFile.name}` : 'Choose JD File (PDF/DOCX/TXT)'}
                </button>
                {jdFile && (
                  <button
                    className="clear-file-btn"
                    onClick={() => {
                      setJdFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            <button className={`analyze-button ${loading ? 'loading' : ''}`} disabled={(!jdText.trim() && !jdFile) || loading || !resumeData} onClick={() => void runAnalyze()}>
              {!resumeData ? <Lock size={16} /> : null}
              {loading ? 'Cross-referencing neural embeddings...' : 'Analyze Match'}
            </button>

            {jdResult && (
              <motion.div className="jd-results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <div className="jd-score"><AtsScoreSphere score={jdResult.score} size={82} /><strong>{jdResult.score}/100</strong></div>
                <div><h4>Matched Skills</h4>{(Array.isArray(jdResult.matched_skills) ? jdResult.matched_skills : []).map((skill) => <span key={String(skill)} className="match-pill"><Check size={12} />{skill}</span>)}</div>
                <div><h4>Missing Skills</h4>{(Array.isArray(jdResult.missing_skills) ? jdResult.missing_skills : []).map((skill) => <span key={String(skill)} className="missing-pill"><X size={12} />{skill}</span>)}</div>
                <div className="suggestions">
                  <h4>AI Suggestions</h4>
                  {(Array.isArray(jdResult.suggestions) ? jdResult.suggestions : []).map((item, index) => {
                    const suggestion = typeof item === 'string' ? { text: item, priority: 'Medium' } : item;
                    return <p key={`${suggestion.text}-${index}`}><Lightbulb size={14} /> <span>{suggestion.text}</span><b>{suggestion.priority || 'Medium'}</b></p>;
                  })}
                </div>
                <button className="copy-report" onClick={() => void copyReport()}><Clipboard size={15} /> {copied ? 'Copied' : 'Copy Full Report'}</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
