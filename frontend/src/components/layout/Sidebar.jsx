import { BarChart2, MessageSquare, Settings, Upload } from 'lucide-react';

const nav = [
  { label: 'Upload', icon: Upload },
  { label: 'Chat', icon: MessageSquare },
  { label: 'Analyze', icon: BarChart2 },
  { label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <>
      <aside className="group hidden h-full w-14 overflow-hidden border-r border-surface-border bg-surface transition-all duration-300 hover:w-[200px] md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-[52px] items-center gap-3 px-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo text-xs font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              AH
            </div>
            <span className="whitespace-nowrap text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">Assistant</span>
          </div>
          <nav className="mt-4 space-y-1 px-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-white/48 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="whitespace-nowrap text-sm opacity-0 transition group-hover:opacity-100">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-3 border-t border-surface-border bg-surface/95 backdrop-blur md:hidden">
        {nav.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.label.toLowerCase();
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onTabChange(item.label.toLowerCase())}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
                isActive ? 'text-brand-cyan' : 'text-white/45'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
