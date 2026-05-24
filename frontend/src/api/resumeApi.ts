import { nexusClient } from './nexusClient';

export interface ParsedResume {
  skills?: string[];
  summary?: string;
  experience_years?: number;
  education?: Array<{ institution?: string; degree?: string; year?: string }>;
  projects?: Array<{ name?: string; description?: string; tech_stack?: string[]; relevance?: number }>;
}

export interface ResumeUploadResponse {
  parsed?: ParsedResume;
  ats?: { ats_score?: number; score?: number; level?: string };
  raw_text?: string;
}

export interface ResumeImprovementResponse {
  improvements: string;
  focus_area: string;
}

export interface SalaryExpectationsResponse {
  salary_guidance: string;
  job_context: string;
}

export interface JDMatchResponse {
  match_percentage: number;
  match_level: string;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
  resume_file: string;
  jd_file: string;
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await nexusClient.post<ResumeUploadResponse>('/upload_resume', formData);
  return data;
}

export async function improveResume(
  resumeText: string,
  focusArea?: string
): Promise<ResumeImprovementResponse> {
  const { data } = await nexusClient.post<ResumeImprovementResponse>('/improve_resume', {
    resume_text: resumeText,
    focus_area: focusArea
  });
  return data;
}

export async function getSalaryExpectations(
  resumeText: string,
  jobTitle?: string,
  experienceYears?: number,
  location?: string
): Promise<SalaryExpectationsResponse> {
  const { data } = await nexusClient.post<SalaryExpectationsResponse>('/salary_expectations', {
    resume_text: resumeText,
    job_title: jobTitle,
    experience_years: experienceYears,
    location: location
  });
  return data;
}

export async function matchResumeWithJDFile(
  resumeFile: File,
  jdFile: File
): Promise<JDMatchResponse> {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jd_file', jdFile);
  const { data } = await nexusClient.post<JDMatchResponse>('/match_with_jd_file', formData);
  return data;
}
