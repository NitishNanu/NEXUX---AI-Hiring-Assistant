/**
 * MCQ Questions API Service
 * Handles multiple choice questions and submissions
 */

import { nexusClient } from './nexusClient';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
  explanation: string;
}

export interface SubmitMCQRequest {
  interview_session_id: string;
  question_id: string;
  selected_option: number;
  duration_seconds: number;
}

export interface MCQSubmissionResponse {
  answer_id: string;
  is_correct: boolean;
  correct_option: number;
  selected_option: number;
  explanation: string;
  score: number;
}

export interface MCQBatch {
  questions: MCQQuestion[];
  topic: string;
  difficulty: string;
  total_count: number;
}

export interface MCQStats {
  total_attempted: number;
  correct: number;
  accuracy: number;
  by_topic: Record<string, { attempted: number; correct: number; accuracy: number }>;
  by_difficulty: Record<
    string,
    { attempted: number; correct: number; accuracy: number }
  >;
}

class MCQApi {
  /**
   * Get a specific MCQ question
   */
  async getQuestion(questionId: string): Promise<MCQQuestion> {
    try {
      const response = await nexusClient.get<MCQQuestion>(
        `/mcq/question/${questionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching MCQ question:', error);
      throw error;
    }
  }

  /**
   * Submit MCQ answer
   */
  async submitAnswer(request: SubmitMCQRequest): Promise<MCQSubmissionResponse> {
    try {
      const response = await nexusClient.post<MCQSubmissionResponse>(
        '/mcq/submit',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting MCQ answer:', error);
      throw error;
    }
  }

  /**
   * Get batch of MCQ questions by topic
   */
  async getQuestionBatch(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    limit: number = 5
  ): Promise<MCQQuestion[]> {
    try {
      const response = await nexusClient.get<MCQQuestion[]>(
        `/mcq/batch/${topic}?difficulty=${difficulty}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching MCQ batch:', error);
      return [];
    }
  }

  /**
   * Get all available MCQ topics
   */
  async getTopics(): Promise<{
    topics: string[];
    total_questions: number;
  }> {
    try {
      const response = await nexusClient.get<{
        topics: string[];
        total_questions: number;
      }>('/mcq/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      return { topics: [], total_questions: 0 };
    }
  }

  /**
   * Get user's MCQ statistics
   */
  async getStats(): Promise<MCQStats> {
    try {
      const response = await nexusClient.get<MCQStats>('/mcq/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching MCQ stats:', error);
      return {
        total_attempted: 0,
        correct: 0,
        accuracy: 0,
        by_topic: {},
        by_difficulty: {},
      };
    }
  }

  /**
   * Get questions by topic and difficulty
   */
  async getQuestionsByTopic(
    topic: string,
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<MCQQuestion[]> {
    try {
      let url = `/mcq/batch/${topic}`;
      if (difficulty) {
        url += `?difficulty=${difficulty}`;
      }
      const response = await nexusClient.get<MCQQuestion[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions by topic:', error);
      return [];
    }
  }

  /**
   * Get weak areas for MCQ
   */
  async getWeakAreas(): Promise<string[]> {
    try {
      const stats = await this.getStats();
      const weakAreas = Object.entries(stats.by_topic)
        .filter(([_, data]) => data.accuracy < 60)
        .map(([topic]) => topic);
      return weakAreas;
    } catch (error) {
      console.error('Error identifying weak areas:', error);
      return [];
    }
  }

  /**
   * Get recommended topics based on performance
   */
  async getRecommendedTopics(): Promise<string[]> {
    try {
      const weakAreas = await this.getWeakAreas();
      return weakAreas.slice(0, 3); // Top 3 weak areas
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}

export const mcqApi = new MCQApi();
