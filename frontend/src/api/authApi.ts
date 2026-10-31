/**
 * Auth API service.
 *
 * All resume uploads go through /auth/resume so they are associated with the
 * logged-in user's MongoDB profile.  The public /upload_resume endpoint is
 * kept for anonymous ATS scoring but should NOT be used here.
 */

import { nexusClient } from './nexusClient';
import type { AuthUser } from '../store/authStore';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface StoredResume {
  user_id: string;
  filename: string;
  raw_text: string;
  skills: string[];
  experience_years: number;
  ats_score: number;
  ats_level: string;
  summary: string;
  education: string;
  projects: string;
  uploaded_at: string;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await nexusClient.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await nexusClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await nexusClient.get<AuthUser>('/auth/me');
  return data;
}

/**
 * Upload resume and persist it under the logged-in user's profile.
 *
 * This intentionally targets /auth/resume (not /upload_resume) so the
 * resume is linked to the user's MongoDB document and accessible across
 * all sessions.
 */
export async function uploadResumeAuth(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await nexusClient.post('/auth/resume', form);
  return data;
}

/** Fetch the last resume this user uploaded from their profile. */
export async function fetchUserResume(): Promise<{ resume: StoredResume | null }> {
  const { data } = await nexusClient.get<{ resume: StoredResume | null }>('/auth/resume');
  return data;
}