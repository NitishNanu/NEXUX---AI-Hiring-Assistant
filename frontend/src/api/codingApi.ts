/**
 * Coding Challenges API Service
 * Handles code execution, submission, and evaluation
 */

import { nexusClient } from './nexusClient';

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

export interface CodingSubmissionRequest extends ExecuteCodeRequest {
  // Same as ExecuteCodeRequest
}

export interface CodeQuality {
  line_count: number;
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
}

class CodingApi {
  /**
   * Get a coding problem by ID
   */
  async getProblem(problemId: string): Promise<CodingProblem> {
    try {
      const response = await nexusClient.get<CodingProblem>(
        `/coding/problem/${problemId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching problem:', error);
      throw error;
    }
  }

  /**
   * Run code against test cases
   */
  async runCode(request: ExecuteCodeRequest): Promise<ExecutionResponse> {
    try {
      const response = await nexusClient.post<ExecutionResponse>(
        '/coding/run',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error executing code:', error);
      return {
        success: false,
        passed: 0,
        total: 0,
        test_results: [],
        execution_time_ms: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Submit coding solution and get AI evaluation
   */
  async submitSolution(request: CodingSubmissionRequest): Promise<CodingEvaluation> {
    try {
      const response = await nexusClient.post<CodingEvaluation>(
        '/coding/submit',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  }

  /**
   * Get hints for a coding problem
   */
  async getHints(problemId: string): Promise<string[]> {
    try {
      const response = await nexusClient.post<{ hints: string[] }>(
        `/coding/hints/${problemId}`,
        {}
      );
      return response.data.hints;
    } catch (error) {
      console.error('Error fetching hints:', error);
      return [
        'Break down the problem into smaller parts',
        'Think about edge cases',
        'Consider the time and space complexity',
      ];
    }
  }

  /**
   * Get coding problems by difficulty
   */
  async getProblemsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert',
    limit: number = 10
  ): Promise<CodingProblem[]> {
    try {
      const response = await nexusClient.get<CodingProblem[]>(
        `/coding/problems/difficulty/${difficulty}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching problems:', error);
      return [];
    }
  }

  /**
   * Analyze code quality without execution
   */
  async analyzeCodeQuality(
    code: string,
    language: string
  ): Promise<CodeQuality> {
    try {
      const response = await nexusClient.post<CodeQuality>(
        '/coding/analyze',
        { code, language }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing code:', error);
      return {
        line_count: 0,
        has_comments: false,
        complexity_estimate: 'Unknown',
        style_issues: [],
      };
    }
  }

  /**
   * Get user's coding statistics
   */
  async getCodingStats(): Promise<{
    total_problems_solved: number;
    accepted_submissions: number;
    avg_score: number;
    by_difficulty: Record<string, { attempted: number; solved: number }>;
    by_category: Record<string, { attempted: number; solved: number }>;
  }> {
    try {
      const response = await nexusClient.get<any>(
        '/coding/stats'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total_problems_solved: 0,
        accepted_submissions: 0,
        avg_score: 0,
        by_difficulty: {},
        by_category: {},
      };
    }
  }

  /**
   * Get problem recommendations based on weak areas
   */
  async getRecommendedProblems(weakTopics: string[]): Promise<CodingProblem[]> {
    try {
      const response = await nexusClient.post<CodingProblem[]>(
        '/coding/recommend',
        { weak_topics: weakTopics }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
}

export const codingApi = new CodingApi();
