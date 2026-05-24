import { AnimatePresence, motion } from 'framer-motion';
import { FileCheck2, FileText, Replace, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

// ✅ Correct import
import { uploadResumeAuth } from '../../api/authApi';

import { useNexusStore } from '../../store/nexusStore';
import { nexusToast } from '../ui/NexusToast';

const validTypes = ['pdf', 'docx', 'doc', 'txt'];

export default function QuantumDropZone() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const {
    resumeData,
    setResumeData,
    setLoadingResume,
    isLoadingResume,
  } = useNexusStore();

  // ✅ File validation
  const validate = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !!ext && validTypes.includes(ext);
  };

  // ✅ Upload + Parse Resume
  const parseFile = async (file: File) => {
    if (!validate(file)) {
      nexusToast(
        'Invalid file type - only PDF, DOCX, DOC, TXT',
        'error'
      );
      return;
    }

    setLoadingResume(true);
    setProgress(12);

    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(92, value + 11));
    }, 220);

    try {
      // ✅ Auth API call (MongoDB save)
      const data = await uploadResumeAuth(file);

      // ✅ ATS Score
      const score =
        data.ats?.score ??
        data.ats?.ats_score ??
        0;

      // ✅ Store in Zustand
      setResumeData({
        file,
        rawText: data.raw_text ?? '',
        parsed: data.parsed ?? {},
        ats: {
          score,
          level:
            data.ats?.level ??
            data.ats?.match_level ??
            (score >= 75
              ? 'STRONG'
              : score >= 50
              ? 'MODERATE'
              : 'WEAK'),
        },
        uploadedAt: new Date(),
      });

      setProgress(100);

      // ✅ Confetti
      window.confetti?.({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#7C3AED', '#00FFD1'],
      });

      nexusToast(
        'Resume uploaded - AI parsing complete',
        'success'
      );
    } catch (error) {
      nexusToast(
        error instanceof Error
          ? error.message
          : 'Resume upload failed',
        'error'
      );
    } finally {
      window.clearInterval(timer);

      setTimeout(() => {
        setLoadingResume(false);
        setProgress(0);
      }, 450);
    }
  };

  return (
    <section
      className={`quantum-zone 
      ${dragging ? 'dragging' : ''} 
      ${isLoadingResume ? 'uploading' : ''} 
      ${resumeData ? 'compact' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files[0];

        if (file) {
          void parseFile(file);
        }
      }}
    >
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.doc,.txt"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void parseFile(file);
          }
        }}
      />

      <AnimatePresence mode="wait">
        {resumeData ? (
          // ✅ Success State
          <motion.div
            key="success"
            className="compact-upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FileCheck2 className="text-emerald" />

            <div className="min-w-0">
              <p className="truncate font-semibold text-glacier">
                {resumeData.file.name}
              </p>

              <p className="text-xs text-glacier/55">
                ATS preview: {resumeData.ats.score}/100
              </p>
            </div>

            <button
              className="ghost-button ml-auto"
              onClick={() => inputRef.current?.click()}
            >
              <Replace size={16} />
              Replace
            </button>
          </motion.div>
        ) : (
          // ✅ Idle State
          <motion.button
            key="idle"
            type="button"
            className="upload-core"
            onClick={() => inputRef.current?.click()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Outer Ring */}
            <svg className="ring ring-outer" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="102" />
            </svg>

            {/* Inner Ring */}
            <svg className="ring ring-inner" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="78" />
            </svg>

            {/* Upload Icon */}
            <span className="upload-orb">
              <UploadCloud size={42} />
            </span>

            {/* Main Text */}
            <span className="font-display text-lg">
              {dragging
                ? 'Release to upload'
                : isLoadingResume
                ? 'AI is reading your story...'
                : 'Drop your resume into the void'}
            </span>

            {/* Sub Text */}
            <span className="text-sm text-glacier/58">
              or click to materialize from your machine
            </span>

            {/* File Type Pills */}
            <span className="mt-3 flex flex-wrap justify-center gap-2">
              {validTypes.map((type, index) => (
                <motion.span
                  key={type}
                  className="format-pill"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  {type.toUpperCase()}
                </motion.span>
              ))}
            </span>

            {/* Progress Ring */}
            {isLoadingResume && (
              <span
                className="progress-ring"
                style={{
                  background: `conic-gradient(
                    #7C3AED ${progress * 3.6}deg,
                    transparent 0deg
                  )`,
                }}
              >
                <FileText size={22} />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}