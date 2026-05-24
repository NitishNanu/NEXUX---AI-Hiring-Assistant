import { nexusClient } from './nexusClient';

export interface AtsResult {
  score: number;
  level?: string;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: Array<{ text: string; priority?: 'High' | 'Medium' | 'Low' | string } | string>;
}

type AtsScoreApiResponse = {
  mode?: string;
  ats?: {
    ats_score?: number;
    match_level?: string;
    matched_skills?: string[];
    missing_skills?: string[];
    suggestions?: Array<{ text: string; priority?: string } | string>;
  };
  ats_score?: number;
  match_level?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  suggestions?: Array<{ text: string; priority?: string } | string>;
};

function normalizeAtsResult(data: AtsScoreApiResponse): AtsResult {
  const payload = data.ats || data;
  return {
    score: payload.ats_score ?? data.ats_score ?? 0,
    level: payload.match_level ?? data.match_level,
    matched_skills: Array.isArray(payload.matched_skills) ? payload.matched_skills : [],
    missing_skills: Array.isArray(payload.missing_skills) ? payload.missing_skills : [],
    suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : []
  };
}

export async function analyzeAts(resume: File, jdText: string): Promise<AtsResult> {
  const formData = new FormData();
  formData.append('resume', resume);
  formData.append('jd_text', jdText);
  const { data } = await nexusClient.post<AtsScoreApiResponse>('/ats_score', formData);
  return normalizeAtsResult(data);
}
