/**
 * Interview API Service
 * Handles all API calls related to interview sessions, questions, and analytics
 */

import { nexusClient } from './nexusClient';

export interface StartInterviewRequest {
  interview_type: string;
  selected_role: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'behavioral' | 'technical' | 'coding' | 'system_design' | 'mcq' | 'hr';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  questionText: string;
  whyAsked: string;
  expectedTraits: string[];
  followUpQuestions: string[];
  aiHints: string[];
  idealAnswer: string;
}

export interface SubmitAnswerRequest {
  interview_session_id: string;
  question_id: string;
  answer_text: string;
  duration_seconds: number;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  followUpQuestions: string[];
  readinessScore: number;
}

export interface InterviewSession {
  session_id: string;
  user_id: string;
  interview_type: string;
  selected_role: string;
  status: 'in_progress' | 'completed';
  questions: InterviewQuestion[];
  current_question_index: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeIntelligence {
  ats_score: number;
  resume_strength: number;
  interview_readiness: number;
  missing_skills: string[];
  ai_confidence: number;
  recommended_role: string;
  experience_summary: string;
}

export interface InterviewAnalytics {
  communication: number;
  technical_depth: number;
  confidence: number;
  problem_solving: number;
  leadership: number;
  system_design: number;
  coding: number;
  communication_trend: number[];
  coding_trend: number[];
  topic_weaknesses: Record<string, number>;
  readiness_score: number;
  session_history: any[];
}

class InterviewApi {
  /**
   * Start a new interview session
   */
  async startInterview(request: StartInterviewRequest): Promise<InterviewSession> {
    try {
      const response = await nexusClient.post<InterviewSession>(
        '/mock-interview/start',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  /**
   * Get next question in interview
   */
  async getNextQuestion(sessionId: string): Promise<InterviewQuestion> {
    try {
      const response = await nexusClient.get<InterviewQuestion>(
        `/mock-interview/question/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  }

  /**
   * Get all questions for a category
   */
  async getQuestionsByCategory(
    category: string,
    limit: number = 5
  ): Promise<InterviewQuestion[]> {
    try {
      const response = await nexusClient.get<InterviewQuestion[]>(
        `/mock-interview/questions/${category}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  /**
   * Submit answer and get evaluation
   */
  async submitAnswer(request: SubmitAnswerRequest): Promise<AnswerEvaluation> {
    try {
      const response = await nexusClient.post<AnswerEvaluation>(
        '/mock-interview/submit-answer',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Get interview analytics for a session
   */
  async getSessionAnalytics(sessionId: string): Promise<InterviewAnalytics> {
    try {
      const response = await nexusClient.get<InterviewAnalytics>(
        `/mock-interview/analytics/${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get user's all-time interview analytics
   */
  async getUserAnalytics(): Promise<InterviewAnalytics> {
    try {
      const response = await nexusClient.get<InterviewAnalytics>(
        '/mock-interview/user-analytics'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  /**
   * Get resume intelligence for personalization
   */
  async getResumeIntelligence(): Promise<ResumeIntelligence> {
    try {
      const response = await nexusClient.get<ResumeIntelligence>(
        '/mock-interview/resume-intelligence'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching resume intelligence:', error);
      // Return default values if API fails
      return {
        ats_score: 0,
        resume_strength: 0,
        interview_readiness: 0,
        missing_skills: [],
        ai_confidence: 0,
        recommended_role: 'Software Engineer',
        experience_summary: 'No resume uploaded',
      };
    }
  }

  /**
   * End interview session
   */
  async endInterview(sessionId: string): Promise<{ completed: boolean; score: number }> {
    try {
      const response = await nexusClient.post<{ completed: boolean; score: number }>(
        `/mock-interview/end/${sessionId}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error ending interview:', error);
      throw error;
    }
  }

  /**
   * Get interview history for a user
   */
  async getInterviewHistory(limit: number = 10): Promise<InterviewSession[]> {
    try {
      const response = await nexusClient.get<InterviewSession[]>(
        `/mock-interview/history?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  /**
   * Get hints for current question
   */
  async getHints(sessionId: string, questionId: string): Promise<string[]> {
    try {
      const response = await nexusClient.get<{ hints: string[] }>(
        `/mock-interview/hints/${sessionId}/${questionId}`
      );
      return response.data.hints;
    } catch (error) {
      console.error('Error fetching hints:', error);
      return [];
    }
  }
}

export const interviewApi = new InterviewApi();
