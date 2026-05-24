import { useEffect, useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import useResume, { validateResumeFile } from '../../hooks/useResume';
import Spinner from '../ui/Spinner';

const formats = ['PDF', 'DOCX', 'DOC', 'TXT'];

export default function DropZone({ resumeData, isLoading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const { handleUpload } = useResume();

  useEffect(() => {
    if (!error) return undefined;
    const timeout = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timeout);
  }, [error]);

  async function acceptFile(file) {
    if (!file) return;
    if (!validateResumeFile(file)) {
      setError('Unsupported file type. Upload PDF, DOCX, DOC, or TXT.');
      return;
    }
    await handleUpload(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border-2 border-dashed border-brand-indigo/55 bg-brand-indigo/5 p-5">
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium text-white">Parsing resume with AI...</p>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-indigo" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resumeData.file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-surface-border bg-white/[0.04] p-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-brand-cyan" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{resumeData.file.name}</p>
            <p className="text-xs text-status-green">Resume loaded</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-brand-indigo/40 hover:text-white"
        >
          Replace
        </button>
        <input ref={inputRef} type="file" hidden onChange={(event) => acceptFile(event.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Resume upload area, press Enter or Space to browse"
        onKeyDown={handleKeyDown}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`rounded-lg border-2 border-dashed p-7 text-center transition hover:border-brand-indigo/60 hover:bg-brand-indigo/5 ${
          isDragging ? 'drag-border bg-brand-cyan/5' : error ? 'border-status-red/70' : 'border-white/12'
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-brand-indigo" />
        <p className="mt-4 text-sm font-medium text-white">Drop your resume here</p>
        <p className="mt-1 text-xs text-white/45">or click to browse</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {formats.map((format) => (
            <span key={format} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/45">
              {format}
            </span>
          ))}
        </div>
        <input ref={inputRef} type="file" hidden onChange={(event) => acceptFile(event.target.files?.[0])} />
      </div>
      {error && <p className="mt-2 text-xs text-status-red">{error}</p>}
    </div>
  );
}
