import { useState } from 'react';
import { motion } from 'framer-motion';
import AtsScoreRing from './AtsScoreRing';
import SkillPill from './SkillPill';
import Badge from '../ui/Badge';
import CollapsibleSection from '../ui/CollapsibleSection';
import GlassCard from '../ui/GlassCard';

function SkeletonPanel() {
  return (
    <GlassCard className="p-5">
      <div className="mx-auto h-28 w-28 rounded-full shimmer" />
      <div className="mt-6 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-7 rounded-full shimmer" />
        ))}
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 rounded shimmer" />
        <div className="h-3 w-5/6 rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
      </div>
    </GlassCard>
  );
}

function extractItemsFromText(text) {
  if (Array.isArray(text)) return text;
  if (!text || typeof text !== 'string') return [];
  
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function getTitle(item, fallback) {
  if (typeof item === 'string') return item;
  return item?.school || item?.institution || item?.name || item?.title || fallback;
}

export default function ResumePanel({ resumeData, isLoading }) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return <SkeletonPanel />;
  if (!resumeData.parsed) return null;

  const skills = Array.isArray(resumeData.parsed.skills) ? resumeData.parsed.skills : [];
  const education = extractItemsFromText(resumeData.parsed.education);
  const projects = extractItemsFromText(resumeData.parsed.projects);
  
  const visibleSkills = expanded ? skills : skills.slice(0, 6);
  const remaining = Math.max(0, skills.length - visibleSkills.length);

  return (
    <GlassCard
      className="h-full overflow-y-auto p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="animate-fade-up">
        <AtsScoreRing score={resumeData.ats?.score} level={resumeData.ats?.level} />

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Skills</h2>
            <Badge variant="indigo">{skills.length} detected</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((skill) => (
              <SkillPill key={skill} skill={skill} />
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-brand-cyan transition hover:border-brand-cyan/40"
              >
                + {remaining} more
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <CollapsibleSection title="Summary" defaultOpen>
            {resumeData.parsed.summary || 'No summary extracted yet.'}
          </CollapsibleSection>

          <CollapsibleSection title="Education" meta={`${education.length || 0}`}>
            <div className="space-y-3">
              {education.length ? (
                education.map((item, index) => (
                  <div key={`${getTitle(item, 'Education')}-${index}`}>
                    <p className="font-medium text-white">{getTitle(item, 'Education')}</p>
                    {typeof item !== 'string' && (
                      <p className="text-xs text-white/48">
                        {[item.degree, item.year].filter(Boolean).join(' - ') || item.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p>No education entries found.</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Projects" meta={`${projects.length || 0}`}>
            <div className="space-y-3">
              {projects.length ? (
                projects.map((item, index) => (
                  <div key={`${getTitle(item, 'Project')}-${index}`}>
                    <p className="font-medium text-white">{getTitle(item, 'Project')}</p>
                    {typeof item !== 'string' && <p className="text-xs text-white/48">{item.description || item.summary}</p>}
                  </div>
                ))
              ) : (
                <p>No projects extracted.</p>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </motion.div>
    </GlassCard>
  );
}
