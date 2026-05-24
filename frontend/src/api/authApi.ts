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

/** Upload resume — saves to MongoDB under the logged-in user. */
export async function uploadResumeAuth(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await nexusClient.post('/auth/resume', form);
  return data;
}

/** Fetch the last resume this user uploaded. */
export async function fetchUserResume(): Promise<{ resume: StoredResume | null }> {
  const { data } = await nexusClient.get<{ resume: StoredResume | null }>('/auth/resume');
  return data;
}