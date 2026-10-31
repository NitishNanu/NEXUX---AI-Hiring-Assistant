/**
 * Coding Challenges API Service
 *
 * All endpoints now have corresponding backend implementations.
 *
 * Endpoint map:
 *  GET  /coding/problem/:id            → getProblem
 *  POST /coding/run                    → runCode
 *  POST /coding/submit                 → submitSolution
 *  POST /coding/hints/:id              → getHints
 *  GET  /coding/problems/difficulty/:d → getProblemsByDifficulty
 *  POST /coding/analyze                → analyzeCodeQuality   [was missing, now implemented]
 *  GET  /coding/stats                  → getCodingStats        [was missing, now implemented]
 *  POST /coding/recommend              → getRecommendedProblems [was missing, now implemented]
 */

import { nexusClient } from './nexusClient';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  expected_time_complexity: string;
  expected_space_complexity: string;
  hints: string[];
}

export interface ExecuteCodeRequest {
  interview_session_id: string;
  question_id: string;
  code: string;
  language: 'python' | 'javascript' | 'java' | 'cpp' | 'go';
  duration_seconds: number;
}

export interface TestResult {
  input: string;
  expected_output: string;
  actual_output: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResponse {
  success: boolean;
  passed: number;
  total: number;
  test_results: TestResult[];
  execution_time_ms: number;
  errors: string[];
}

export type CodingSubmissionRequest = ExecuteCodeRequest;

export interface CodeQuality {
  language: string;
  line_count: number;
  non_empty_lines: number;
  has_comments: boolean;
  complexity_estimate: string;
  style_issues: string[];
}

export interface CodingEvaluation {
  submission_id: string;
  overall_score: number;
  correctness: number;
  efficiency: number;
  code_quality: number;
  passed_tests: number;
  total_tests: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  optimal_solution?: string;
  time_complexity_actual?: string;
  space_complexity_actual?: string;
}

export interface CodingStats {
  total_problems_solved: number;
  accepted_submissions: number;
  acceptance_rate: number;
  avg_score: number;
  by_difficulty: Record<string, { attempted: number; solved: number }>;
  by_category: Record<string, { attempted: number; solved: number }>;
  recent_submissions: Array<{
    submission_id: string;
    problem_id: string;
    language: string;
    passed_tests: number;
    total_tests: number;
    overall_score: number;
    created_at: string;
  }>;
}

// ---------------------------------------------------------------------------
// API class
// ---------------------------------------------------------------------------

class CodingApi {
  /** Get a coding problem by ID. */
  async getProblem(problemId: string): Promise<CodingProblem> {
    const { data } = await nexusClient.get<CodingProblem>(`/coding/problem/${problemId}`);
    return data;
  }

  /** Run code against test cases without recording a submission. */
  async runCode(request: ExecuteCodeRequest): Promise<ExecutionResponse> {
    try {
      const { data } = await nexusClient.post<ExecutionResponse>('/coding/run', request);
      return data;
    } catch (err) {
      console.error('runCode error:', err);
      return {
        success: false,
        passed: 0,
        total: 0,
        test_results: [],
        execution_time_ms: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error'],
      };
    }
  }

  /** Submit a coding solution and receive AI evaluation + test results. */
  async submitSolution(request: CodingSubmissionRequest): Promise<CodingEvaluation> {
    const { data } = await nexusClient.post<CodingEvaluation>('/coding/submit', request);
    return data;
  }

  /** Get AI hints for a specific coding problem. */
  async getHints(problemId: string, code?: string): Promise<string[]> {
    try {
      const { data } = await nexusClient.post<{ hints: string[] }>(
        `/coding/hints/${problemId}`,
        { code: code ?? '' }
      );
      return data.hints ?? [];
    } catch {
      return [
        'Break the problem into smaller sub-problems.',
        'Think about edge cases: empty input, duplicates, negatives.',
        'Optimise for time complexity first, then space.',
      ];
    }
  }

  /** Get problems by difficulty level. */
  async getProblemsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    limit = 10
  ): Promise<CodingProblem[]> {
    try {
      const { data } = await nexusClient.get<CodingProblem[]>(
        `/coding/problems/difficulty/${difficulty}?limit=${limit}`
      );
      return data;
    } catch {
      return [];
    }
  }

  /**
   * Analyze code quality without executing it.
   * Endpoint: POST /coding/analyze
   */
  async analyzeCodeQuality(code: string, language: string): Promise<CodeQuality> {
    try {
      const { data } = await nexusClient.post<CodeQuality>('/coding/analyze', { code, language });
      return data;
    } catch {
      return {
        language,
        line_count: 0,
        non_empty_lines: 0,
        has_comments: false,
        complexity_estimate: 'Unknown',
        style_issues: [],
      };
    }
  }

  /**
   * Get user's aggregated coding statistics.
   * Endpoint: GET /coding/stats
   */
  async getCodingStats(): Promise<CodingStats> {
    try {
      const { data } = await nexusClient.get<CodingStats>('/coding/stats');
      return data;
    } catch {
      return {
        total_problems_solved: 0,
        accepted_submissions: 0,
        acceptance_rate: 0,
        avg_score: 0,
        by_difficulty: {},
        by_category: {},
        recent_submissions: [],
      };
    }
  }

  /**
   * Get problem recommendations targeting weak topic areas.
   * Endpoint: POST /coding/recommend
   */
  async getRecommendedProblems(weakTopics: string[]): Promise<CodingProblem[]> {
    try {
      const { data } = await nexusClient.post<{ problems: CodingProblem[] }>(
        '/coding/recommend',
        { weak_topics: weakTopics }
      );
      return data.problems ?? [];
    } catch {
      return [];
    }
  }
}

export const codingApi = new CodingApi();
