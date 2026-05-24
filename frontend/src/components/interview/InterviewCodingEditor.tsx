import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useState, useRef } from 'react';
import { Play, RotateCcw, Download, Copy, Lightbulb, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodingEditorProps {
  problem: {
    title: string;
    description: string;
    constraints: string[];
    examples: Array<{ input: string; output: string; explanation: string }>;
    expectedTimeComplexity: string;
    expectedSpaceComplexity: string;
  };
  onSubmit: (code: string, language: string) => void;
  onGetHints: () => void;
  isLoading?: boolean;
}

export function InterviewCodingEditor({
  problem,
  onSubmit,
  onGetHints,
  isLoading = false,
}: CodingEditorProps) {
  const [code, setCode] = useState('# Write your solution here\n\ndef solve():\n    pass\n');
  const [language, setLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState('editor'); // editor, tests, hints
  const [testResults, setTestResults] = useState<any>(null);
  const [showOutput, setShowOutput] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'cpp', name: 'C++', ext: '.cpp' },
  ];

  const handleRun = async () => {
    try {
      // Simulate code execution
      const result = {
        status: 'completed',
        passed: 2,
        total: 3,
        runtime: '45ms',
        memory: '12.5MB',
        tests: [
          {
            input: problem.examples[0]?.input || 'N/A',
            output: problem.examples[0]?.output || 'N/A',
            passed: true,
            time: '10ms',
          },
          {
            input: problem.examples[1]?.input || 'N/A',
            output: problem.examples[1]?.output || 'N/A',
            passed: true,
            time: '15ms',
          },
          {
            input: 'Edge case',
            output: 'Expected',
            passed: false,
            time: '20ms',
          },
        ],
      };

      setTestResults(result);
      setShowOutput(true);

      if (result.passed === result.total) {
        toast.success('All tests passed! 🎉');
      } else {
        toast.error(`${result.total - result.passed} test(s) failed`);
      }
    } catch (error) {
      toast.error('Error running code');
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }
    onSubmit(code, language);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleDownloadCode = () => {
    const lang = languages.find((l) => l.id === language);
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `solution${lang?.ext || '.txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code downloaded');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{problem.title}</h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              Difficulty: {problem?.constraints?.[0] || 'Medium'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              Time: {problem.expectedTimeComplexity || 'O(n)'}
            </span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/70">Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-colors"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['editor', 'tests', 'hints'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-white/60 hover:text-white/80'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Editor tab */}
      <AnimatePresence>
        {activeTab === 'editor' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/50"
          >
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                suggestions: true,
              }}
            />
          </motion.div>
        )}

        {/* Tests tab */}
        {activeTab === 'tests' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-4"
          >
            {problem.examples.map((example, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-2">
                <h4 className="font-semibold text-white">Example {idx + 1}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 mb-1 font-medium">Input:</p>
                    <pre className="bg-black/50 p-2 rounded border border-white/10 text-green-400 font-mono text-xs overflow-x-auto">
                      {example.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1 font-medium">Output:</p>
                    <pre className="bg-black/50 p-2 rounded border border-white/10 text-blue-400 font-mono text-xs overflow-x-auto">
                      {example.output}
                    </pre>
                  </div>
                </div>
                {example.explanation && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/60 text-xs mb-1 font-medium">Explanation:</p>
                    <p className="text-white/70 text-xs leading-relaxed">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Hints tab */}
        {activeTab === 'hints' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto space-y-4"
          >
            <div className="p-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-center">
              <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-white/70 mb-4 text-sm">Need help solving this problem?</p>
              <button
                onClick={onGetHints}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold transition-all"
              >
                Get AI Hints
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {showOutput && testResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">Test Results</h4>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    testResults.passed === testResults.total
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}
                >
                  {testResults.passed}/{testResults.total} Passed
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {testResults.tests.map((test: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    test.passed
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <span className={`text-lg flex-shrink-0 ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {test.passed ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70">
                      <span className="font-semibold">Test {idx + 1}</span> - {test.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRun}
          disabled={isLoading}
          className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
        >
          <Play className="w-4 h-4 inline mr-2" />
          Run Code
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyCode}
          className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all"
        >
          <Copy className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCode('# Write your solution here\n\n')}
          className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadCode}
          className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all"
        >
          <Download className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Submit
        </motion.button>
      </div>
    </motion.div>
  );
}

export default InterviewCodingEditor;
