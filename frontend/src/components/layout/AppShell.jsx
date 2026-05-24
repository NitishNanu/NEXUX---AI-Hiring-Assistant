import { Moon } from 'lucide-react';
import Badge from '../ui/Badge';

export default function AppShell({ children, resumeLoaded, activeTab, onTabChange }) {
  return (
    <div className="h-screen overflow-hidden bg-surface text-white">
      <div
        className="hidden h-full md:grid"
        style={{
          gridTemplateAreas: '"header header" "resume chat" "jd chat"',
          gridTemplateColumns: 'minmax(320px, 1fr) 420px',
          gridTemplateRows: '52px minmax(0, 1fr) auto',
        }}
      >
        <header
          style={{ gridArea: 'header' }}
          className="glass-panel flex h-[52px] items-center justify-between border-x-0 border-t-0 px-5"
        >
          <div />
          <h1 className="text-sm font-medium tracking-normal text-white/90">AI Hiring Assistant</h1>
          <div className="flex items-center gap-2">
            <Badge variant={resumeLoaded ? 'green' : 'neutral'}>
              <span className={`h-1.5 w-1.5 rounded-full ${resumeLoaded ? 'bg-status-green' : 'bg-white/35'}`} />
              {resumeLoaded ? 'Resume loaded' : 'No resume'}
            </Badge>
            <button type="button" aria-label="Theme toggle" className="rounded-md border border-white/10 p-2 text-white/55">
              <Moon className="h-4 w-4" />
            </button>
          </div>
        </header>
        {children}
      </div>

      <div className="grid h-full grid-rows-[52px_1fr] md:hidden">
        <header className="glass-panel flex h-[52px] items-center justify-between border-x-0 border-t-0 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-indigo text-xs font-bold">AH</div>
          <h1 className="text-sm font-medium text-white/90">AI Hiring Assistant</h1>
          <Badge variant={resumeLoaded ? 'green' : 'neutral'}>{resumeLoaded ? 'Ready' : 'Empty'}</Badge>
        </header>
        <main className="min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
