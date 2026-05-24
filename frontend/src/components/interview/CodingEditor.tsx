import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Play, RotateCw, Copy, Share2, Zap } from 'lucide-react';

/**
 * CodingEditor - Monaco-based code editor for interview coding challenges
 */
export const CodingEditor = ({
  problem,
  onRun,
  onSubmit,
  isRunning = false,
  output = null,
  testResults = null,
}) => {
  const [code, setCode] = useState(problem?.starter_code || '');
  const [language, setLanguage] = useState(problem?.language || 'python');
  const [theme, setTheme] = useState('vs-dark');

  const languages = [
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'cpp', name: 'C++', ext: '.cpp' },
    { id: 'csharp', name: 'C#', ext: '.cs' },
    { id: 'golang', name: 'Go', ext: '.go' },
  ];

  const handleRunCode = () => {
    onRun({ code, language });
  };

  const handleSubmitCode = () => {
    onSubmit({ code, language });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">{problem?.title}</h3>
            <p className="text-sm text-slate-400">{problem?.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">Difficulty</div>
          <span className={`text-sm font-semibold ${
            problem?.difficulty === 'Easy'
              ? 'text-emerald-400'
              : problem?.difficulty === 'Medium'
              ? 'text-amber-400'
              : 'text-red-400'
          }`}>
            {problem?.difficulty}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-between items-center bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyCode}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="Copy code"
          >
            <Copy size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCode(problem?.starter_code || '')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="Reset code"
          >
            <RotateCw size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run Code
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmitCode}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Zap size={16} />
            Submit
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
          }}
          defaultLanguage="python"
        />
      </div>

      {/* Output */}
      {(output || testResults) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {output && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-bold text-white mb-2">Output</h4>
              <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                {output}
              </pre>
            </div>
          )}

          {testResults && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-bold text-white mb-3">Test Results</h4>
              <div className="space-y-2">
                {testResults.tests.map((test, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-2 rounded ${
                      test.passed
                        ? 'bg-emerald-900/20 border border-emerald-500/30'
                        : 'bg-red-900/20 border border-red-500/30'
                    }`}
                  >
                    <span className="text-sm text-slate-300">Test Case {i + 1}</span>
                    <span
                      className={`text-sm font-semibold ${
                        test.passed ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {test.passed ? '✓ Passed' : '✗ Failed'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Passed:</span> {testResults.passedCount}/{testResults.totalCount}
                </p>
                {testResults.executionTime && (
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold">Time:</span> {testResults.executionTime}ms
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Complexity info */}
      {problem?.expected_time_complexity && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Expected Time</p>
            <p className="text-sm font-mono text-cyan-400">{problem.expected_time_complexity}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Expected Space</p>
            <p className="text-sm font-mono text-cyan-400">{problem.expected_space_complexity}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CodingEditor;
